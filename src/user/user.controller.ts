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
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UserEntity } from './entity/user.entity';
import {
  ActiveSession,
  UserSession,
} from '../core/decorators/activeSession.decorator';
import { GenericSuccessResponseDTO } from '../core/dto/generic-success-response.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // GET /user
  // RETURN ALL USERS FROM DB ( PUBLIC INFO )

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 201,
    description: 'Successfully fetched all users',
    type: UserEntity,
    isArray: true,
  })
  @ApiForbiddenResponse({
    description: 'User must be logged in to fetch all users',
  })
  @Get()
  @Public()
  async findAll(): Promise<UserEntity[]> {
    return await this.userService.findAllEntries();
  }

  // GET /user/license
  // GIVES PUBLISHER LICENSE TO A PLAYER (IMAGINE PAYING A FEE FOR ENTRANCE)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Gives publishing rights to a user after paying the PUBLISHER fee',
  })
  @ApiResponse({
    status: 200,
    description: 'Success!',
    type: GenericSuccessResponseDTO,
  })
  @ApiBadRequestResponse({
    description: 'User already has PUBLISHER rights!',
  })
  @ApiInternalServerErrorResponse({
    description: 'Error while saving user data',
  })
  @Get('license')
  async getPublisherRights(@ActiveSession() user: UserSession) {
    return await this.userService.givePublisherRights(user.userid);
  }

  // GET /user/id
  // RETURN USER INFO FROM USERID

  @ApiOperation({ summary: 'Get a user from his USERID' })
  @ApiResponse({
    status: 201,
    description: 'Successfully fetched user from his USERID',
    type: UserEntity,
  })
  @ApiForbiddenResponse({
    description: 'User must be logged in to fetch all users',
  })
  @ApiNotFoundResponse({
    description: 'User does not exist',
  })
  @Get(':id')
  @Public()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserEntity | null> {
    return await this.userService.findEntry(
      { userid: id },
      { ownedGames: { game: true } },
    );
  }

  // POST /user
  // CREATE A NEW USER INTO DB

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'Successfully created user',
    type: CreateUserResponseDTO,
  })
  @ApiBadRequestResponse({ description: 'Bad payload sent' })
  @ApiConflictResponse({ description: 'User already exists in database' })
  @Post()
  @Public()
  async create(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
  ): Promise<CreateUserResponseDTO> {
    return await this.userService.create(createUserDto);
  }

  // PATCH /user
  // UPDATE CURRENT USER'S DATA

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update active users field data' })
  @ApiResponse({
    status: 201,
    description: 'Successfully updated user',
    type: UpdateUserDto,
  })
  @Patch()
  @Roles([Role.ROLE_PLAYER])
  async update(
    @ActiveSession() user: UserSession,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
  ) {
    if (user) {
      return await this.userService.update(user.userid, updateUserDto);
    }
  }

  // PATCH /user/id
  //  --ADMIN ONLY-- : UPDATE USER'S DATA FROM HIS USERID

  @ApiBearerAuth('access-token')
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
  async updateThis(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(id, updateUserDto);
  }

  // DELETE /user
  // DELETE CURRENT ACTIVE USER FROM DB

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete current active user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted current user',
  })
  @ApiForbiddenResponse({
    description: 'User must be logged in to execute command',
  })
  @Delete()
  @Roles([Role.ROLE_PLAYER])
  async delete(@ActiveSession() user: UserSession) {
    return await this.userService.deleteFromProprety({ userid: user.userid });
  }

  // DELETE /user/id
  //  --ADMIN ONLY-- : DELETE USER FROM HIS USERID

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a user by USERID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted user',
  })
  @ApiForbiddenResponse({
    description: 'User must be ADMIN or higher to execute command',
  })
  @Delete(':id')
  @Roles([Role.ROLE_ADMIN])
  async deleteThis(@Param('id', ParseIntPipe) userid: number) {
    return await this.userService.deleteFromProprety({ userid: userid });
  }
}
