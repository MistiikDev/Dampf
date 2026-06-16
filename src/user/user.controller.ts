import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  ValidationPipe,
  Request,
} from '@nestjs/common';

import { UserService } from './user.service';
import {
  CreateUserDto,
  CreateUserResponseDTO,
} from '../core/dto/create-user.dto';
import { UpdateUserDto } from '../core/dto/update-user.dto';

import { Public } from '../core/decorators/ispublic.decorator';
import { Roles } from '../core/decorators/roles.decorator';
import { Role } from '../roles/roles.enum';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UserEntity } from './entity/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 201,
    description: 'Successfully fetched all users',
    type: UserEntity,
  })
  @ApiForbiddenResponse({
    description: 'User must be logged in to fetch all users',
  })
  @Get()
  @Public()
  findAll() {
    return this.userService.findAll();
  }

  @ApiOperation({ summary: 'Get a user from his USERID' })
  @ApiResponse({
    status: 201,
    description: 'Successfully fetched user from his USERID',
    type: UserEntity,
  })
  @ApiForbiddenResponse({
    description: 'User must be logged in to fetch all users',
  })
  @Get(':id')
  @Public()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'Successfully created user',
    type: CreateUserResponseDTO,
  })
  @ApiBadRequestResponse({ description: 'Bad payload sent ' })
  @Post()
  @Public()
  create(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Update active users field data' })
  @ApiResponse({
    status: 201,
    description: 'Successfully updated user',
    type: UpdateUserDto,
  })
  @Patch()
  @Roles([Role.ROLE_PLAYER])
  update(
    @Request() req: Request,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
  ) {
    const userPayload = req['user']
    if (userPayload) {
      return this.userService.update(userPayload.userid, updateUserDto);
    }
  }

  @ApiOperation({ summary: 'Update target users field data' })
  @ApiResponse({
    status: 201,
    description: 'Successfully updated target user',
    type: UpdateUserDto,
  })
  @ApiForbiddenResponse({
    description: 'User must be ADMIN or higher to execute command',
  })
  @Patch(':id')
  @Roles([Role.ROLE_ADMIN])
  updateThis(@Param('id', ParseIntPipe) id: number) {
    return id;
  }

  @ApiOperation({ summary: 'Delete current active user' })
  @ApiResponse({
    status: 201,
    description: 'Successfully deleted current user',
  })
  @ApiForbiddenResponse({
    description: 'User must be logged in to execute command',
  })
  @Delete()
  @Roles([Role.ROLE_PLAYER])
  delete(@Request() req: Request) {
    const userPayload = req['user'];
    if (userPayload) return this.deleteThis(userPayload.userid);
  }

  @ApiOperation({ summary: 'Delete a user by USERID' })
  @ApiResponse({
    status: 201,
    description: 'Successfully deleted user',
  })
  @ApiForbiddenResponse({
    description: 'User must be ADMIN or higher to execute command',
  })
  @Delete(':id')
  @Roles([Role.ROLE_ADMIN])
  deleteThis(@Param('id', ParseIntPipe) userid: number) {
    return this.userService.delete(userid);
  }
}
