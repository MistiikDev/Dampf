import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RuntimeException } from '@nestjs/core/errors/exceptions';

import { Repository } from 'typeorm';

import {
  CreateUserDto,
  CreateUserResponseDTO,
} from '../core/dto/create-user.dto';
import { Role } from '../roles/roles.enum';
import { UserEntity } from './entity/user.entity';
import { UpdateUserDto } from '../core/dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async findAll() {
    return await this.userRepository.find({ select: { password: false } });
  }

  async findOne(id: number) {
    return await this.userRepository.findOne({
      where: { userid: id },
      select: { password: false },
    });
  }

  async create(user: CreateUserDto) {
    const userid = (await this.userRepository.count()) + 1;

    const new_user = {
      userid: userid,
      ...user,
      role: Role.ROLE_PLAYER,
    };

    try {
      await this.userRepository.save(new_user);

      const userCreateResponse: CreateUserResponseDTO = {
        userid: new_user.userid,
        username: new_user.username,
      };

      return userCreateResponse;
    } catch {
      throw new RuntimeException();
    }
  }
  //

  async getUserByUsername(username: string): Promise<UserEntity> {
    const user: UserEntity | null = await this.userRepository.findOne({
      where: { username: username },
    });

    if (user != null) {
      return user;
    }

    throw new NotFoundException('Username not found in database');
  }

  async update(userid: number, updateUserDto: UpdateUserDto) {
    const user = this.userRepository.findOne({ where: { userid: userid } });

    if (user == undefined) {
      throw new NotFoundException('User not found');
    }

    try {
      await Object.assign(user, updateUserDto);
      //await this.userRepository.save(user);
    } catch {
      throw new RuntimeException();
    }
  }

  async delete(userid: number) {
    return await this.userRepository.delete(userid);
  }
}
