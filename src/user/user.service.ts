import * as bcrypt from 'bcrypt';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CreateUserDto,
  CreateUserResponseDTO,
} from '../core/dto/create-user.dto';
import { Role } from '../roles/roles.enum';
import { UserEntity } from './entity/user.entity';
import { UpdateUserDto } from '../core/dto/update-user.dto';
import { UserPrivateEntity } from './entity/user-private.entity';

import { GenericService } from '../core/generics/generic.service';

@Injectable()
export class UserService extends GenericService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @InjectRepository(UserPrivateEntity)
    private userPrivateRepository: Repository<UserPrivateEntity>,
  ) {
    super(userRepository);
  }

  async savePrivateItem(
    userPrivate: UserPrivateEntity,
  ): Promise<UserPrivateEntity> {
    return await this.userPrivateRepository.save(userPrivate);
  }

  async create(user: CreateUserDto) {
    /*
    User Object is separated into 2 entites
    USER PUBLIC: Contains basic public information (username, owned games, hours played etc..)
    USER PRIVATE: Contains all registration information (email; password hashed, etc..)

    Routes that execute SELECT queries for USER will ONLY return USER PUBLIC information
     */

    const userPublic = new UserEntity();
    userPublic.username = user.username;
    userPublic.role = Role.ROLE_PLAYER;

    const userPrivate: UserPrivateEntity = new UserPrivateEntity();
    userPrivate.firstname = user.firstname;
    userPrivate.lastname = user.lastname;
    userPrivate.email = user.email;

    userPrivate.balance = 0;
    userPrivate.user = userPublic;

    const hashSecret: number = parseInt(
      this.configService.getOrThrow<string>('HASH_SECRET'),
    );

    userPrivate.password = await bcrypt.hash(user.password, hashSecret);

    try {
      await this.savePrivateItem(userPrivate);
      await this.saveItem(userPublic);
    } catch {
      throw new ConflictException('User is already registered!');
    }

    const userCreateResponse: CreateUserResponseDTO = {
      userid: userPublic.userid,
      username: userPublic.username,
    };

    return userCreateResponse;
  }

  async update(userid: string, updateUserDto: UpdateUserDto) {
    /*
    TODO: Right now if the user updates its username or any data stored inside ACCESS_SESSION,
    TODO: the session data will NOT be changed until a new JWT is generated (login / logout or clear jwt)
    */

    if (!updateUserDto || Object.keys(updateUserDto).length === 0) {
      throw new NotAcceptableException('No payload sent');
    }

    const user = await this.findEntry({ userid: userid }, { private: true });
    const userPrivate = user.private;

    Object.assign(user, updateUserDto);

    // Check if there is a password change, if there is hash it.
    if (updateUserDto.password) {
      const hashSecret: number = parseInt(
        this.configService.getOrThrow<string>('HASH_SECRET'),
      );

      userPrivate.password = await bcrypt.hash(
        updateUserDto.password,
        hashSecret,
      );
    }

    const { password, ...clearUpdateUserDto } = updateUserDto;
    Object.assign(userPrivate, clearUpdateUserDto);

    // Update both entries
    try {
      await this.saveItem(user);
      await this.savePrivateItem(userPrivate);

      return clearUpdateUserDto as UpdateUserDto;
    } catch {
      throw new InternalServerErrorException('Could not save user data');
    }
  }

  // INTERNAL ONLY, allows to give created user publishing rights faster than editing the token in swagger
  async givePublisherRights(userid: string) {
    const user = await this.findEntry({ userid: userid });
    if (user.role != Role.ROLE_PLAYER) {
      throw new BadRequestException(
        'Specified user already has publishing rights',
      );
    }
    try {
      user.role = Role.ROLE_PUBLISHER;
      await this.saveItem(user);

      return {
        success: true,
      };
    } catch {
      throw new InternalServerErrorException(
        'Internal error while escalating user rights',
      );
    }
  }

  // TEMPORARY; needs more security / be more generic
  // TODO: Add a generic ModifiyField() method inside Generic Service
  // Problem: Generic Service only references one repository (user has 2)

  async addUserBalance(
    userid: string,
    balanceChange: number,
  ): Promise<boolean> {
    const user = await this.findEntry({ userid: userid }, { private: true });
    const userPrivate = user.private;

    userPrivate.balance += balanceChange;

    await this.savePrivateItem(userPrivate).catch(() => {
      throw new BadRequestException('Error while recharging user balance');
    });

    return true;
  }
}
