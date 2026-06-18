import * as bcrypt from 'bcrypt';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

  async create(user: CreateUserDto) {
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
      await this.userPrivateRepository.save(userPrivate);
      await this.saveItem(userPublic);

      const userCreateResponse: CreateUserResponseDTO = {
        userid: userPublic.userid,
        username: userPublic.username,
      };

      return userCreateResponse;
    } catch {
      throw new HttpException(
        'User is already registered!',
        HttpStatus.CONFLICT,
      );
    }
  }

  async update(userid: number, updateUserDto: UpdateUserDto) {
    /*
    TODO: Right now if the user updates its username or any data stored inside ACCESS_SESSION,
    TODO: the session data will NOT be changed until a new JWT is generated (login / logout or clear jwt)
    */

    if (!updateUserDto || Object.keys(updateUserDto).length === 0) {
      throw new HttpException('No payload sent', HttpStatus.NOT_ACCEPTABLE);
    }

    const user = await this.findEntry({ userid: userid });
    const userPrivate = user.private;

    try {
      Object.assign(user, updateUserDto);
      Object.assign(userPrivate, updateUserDto);

      console.log(userPrivate, user, updateUserDto);

      await this.userRepository.save(user);
      await this.userPrivateRepository.save(userPrivate);

      return updateUserDto;
    } catch {
      throw new HttpException(
        'Could not save user data',
        HttpStatus.FAILED_DEPENDENCY,
      );
    }
  }

  // INTERNAL ONLY
  async givePublisherRights(userid: number) {
    const user = await this.findEntry({ userid: userid });
    if (user.role != Role.ROLE_PLAYER) {
      throw new HttpException(
        'Specified user already has publishing rights',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      user.role = Role.ROLE_PUBLISHER;
      await this.userRepository.save(user);

      return {
        success: true,
      };
    } catch {
      throw new HttpException(
        'Internal error while escalating user rights',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addUserBalance(
    userid: number,
    balanceChange: number,
  ): Promise<boolean> {
    const user = await this.findEntry({ userid: userid });
    const userPrivate = user.private;

    userPrivate.balance += balanceChange;

    await this.userPrivateRepository.save(userPrivate).catch(() => {
      throw new HttpException(
        'Could not save user internal data',
        HttpStatus.BAD_REQUEST,
      );
    });

    return true;
  }
}
