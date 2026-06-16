import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RuntimeException } from '@nestjs/core/errors/exceptions';

import { FindOptionsWhere, Repository } from 'typeorm';

import {
  CreateUserDto,
  CreateUserResponseDTO,
} from '../core/dto/create-user.dto';
import { Role } from '../roles/roles.enum';
import { UserEntity } from './entity/user.entity';
import { UpdateUserDto } from '../core/dto/update-user.dto';
import { UserPrivateEntity } from './entity/user-private.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @InjectRepository(UserPrivateEntity)
    private userPrivateRepository: Repository<UserPrivateEntity>,
  ) {}

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: number) {
    return await this.userRepository.findOne({
      where: { userid: id },
    });
  }

  async create(user: CreateUserDto) {
    const userPublic = new UserEntity();
    userPublic.username = user.username;
    userPublic.role = Role.ROLE_PLAYER;

    try {
      const savedUser = await this.userRepository.save(userPublic);
      const userPrivate: UserPrivateEntity = new UserPrivateEntity();
      userPrivate.firstname = user.firstname;
      userPrivate.lastname = user.lastname;
      userPrivate.email = user.email;

      userPrivate.password = user.password;
      userPrivate.balance = 0;
      userPrivate.user = savedUser;

      await this.userPrivateRepository.save(userPrivate);

      const userCreateResponse: CreateUserResponseDTO = {
        userid: userPublic.userid,
        username: userPublic.username,
      };

      return userCreateResponse;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async update(userid: number, updateUserDto: UpdateUserDto) {
    /*
    TODO: Right now if the user updates its username or any data stored inside ACCESS_SESSION,
    TODO: the session data will NOT be changed until a new JWT is generated (login / logout or refresh)
    */

    const user = await this.getUserBy({ userid: userid });

    if (user == undefined) {
      throw new NotFoundException('User not found');
    }
    const userPrivate = user.private;

    try {
      Object.assign(user, updateUserDto);
      Object.assign(userPrivate, updateUserDto);

      await this.userRepository.save(user);
      await this.userPrivateRepository.save(userPrivate);

      return updateUserDto;
    } catch (e) {
      throw new RuntimeException(e);
    }
  }

  async delete(userid: number) {
    await this.userRepository.delete(userid);
  }

  //
  async getUserBy(filter: FindOptionsWhere<UserEntity>): Promise<UserEntity> {
    const user: UserEntity | null = await this.userRepository.findOne({
      where: filter,
      relations: { private: true },
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user;
  }
}
