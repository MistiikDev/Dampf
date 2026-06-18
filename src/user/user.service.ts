import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  CreateUserDto,
  CreateUserResponseDTO,
} from '../core/dto/create-user.dto';
import { Role } from '../roles/roles.enum';
import { UserEntity } from './entity/user.entity';
import { UpdateUserDto } from '../core/dto/update-user.dto';
import { UserPrivateEntity } from './entity/user-private.entity';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @InjectRepository(UserPrivateEntity)
    private userPrivateRepository: Repository<UserPrivateEntity>,
  ) {
    this.configService = new ConfigService();
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { userid: id },
      relations: { ownedGames: { game: true } },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
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
      await this.userRepository.save(userPublic).catch(() => {
        throw new HttpException(
          'Could not save user data',
          HttpStatus.BAD_REQUEST,
        );
      });

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

    const user = await this.getUserBy({ userid: userid });
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

  async delete(userid: number) {
    await this.userRepository.delete(userid);
  }

  // INTERNAL ONLY
  async givePublisherRights(userid: number) {
    const user = await this.getUserBy({ userid: userid });
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

  async getUserBy(filter: FindOptionsWhere<UserEntity>): Promise<UserEntity> {
    const user: UserEntity | null = await this.userRepository.findOne({
      where: filter,
      relations: { private: true },
    });

    if (user == undefined) {
      throw new HttpException('User was not found!', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async addUserBalance(
    userid: number,
    balanceChange: number,
  ): Promise<boolean> {
    const user = await this.getUserBy({ userid: userid });
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

  async saveRepository(user: UserEntity) {
    return await this.userRepository.save(user);
  }
}
