import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

import { Public } from '../core/decorators/ispublic.decorator';
import { Roles } from '../core/decorators/roles.decorator';
import { Role } from '../roles/roles.enum';

import {
  CreateGameDTO,
  CreateGameResponseDTO,
} from '../core/dto/create-game.dto';
import { UpdateGameDTO } from '../core/dto/update-game.dto';

import { GamesService } from './games.service';

import {
  ActiveSession,
  UserSession,
} from '../core/decorators/activeSession.decorator';
import { GameEntityResponseDTO } from '../core/dto/game-entity.dto';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  // GET /game
  // RETURNS A LIST OF ALL REGISTERED GAMES IN THE DB

  @ApiOperation({ summary: 'Retrieve information from all games' })
  @ApiResponse({
    status: 201,
    description: 'Successfully retrieved games',
    type: GameEntityResponseDTO,
    isArray: true,
  })
  @Get()
  @Public()
  findAll() {
    return this.gamesService.findAllEntries();
  }

  // GET /game/id
  // RETURNS GAME DATA FROM GAMEID

  @ApiOperation({ summary: 'Retrieve information from a game by GAMEID' })
  @ApiResponse({
    status: 201,
    description: 'Successfully retreived game',
    type: GameEntityResponseDTO,
  })
  @Get(':id')
  @Public()
  findOne(@Param('id', ParseIntPipe) gameid: number) {
    return this.gamesService.findEntry({ gameid: gameid });
  }

  // POST /game
  // --PUBLISHER ONLY--: PUBLISH A GAME INTO DB AS OWN
  // --ADMIN ONLY--: PUBLISH A GAME INTO DB

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Publish a game' })
  @ApiResponse({
    status: 201,
    description: 'Successfully published game',
    type: CreateGameResponseDTO,
  })
  @ApiForbiddenResponse({
    description: 'You need to be a PUBLISHER to publish a game',
  })
  @ApiUnprocessableEntityResponse({
    description: 'Internal error while saving content',
  })
  @Post()
  @Roles([Role.ROLE_ADMIN, Role.ROLE_PUBLISHER])
  async create(
    @ActiveSession() user: UserSession,
    @Body(new ValidationPipe()) createGameDto: CreateGameDTO,
  ) {
    return await this.gamesService.create(user.userid, createGameDto);
  }

  // POST /game/id
  // --PUBLISHER ONLY--: EDIT PUBLISHED GAME'S INFO
  // --ADMIN ONLY--:     EDIT ANY GAME'S INFO

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Edit a personal games information' })
  @ApiResponse({
    status: 201,
    description: 'Successfully published game',
    type: UpdateGameDTO,
  })
  @ApiForbiddenResponse({
    description: 'You need to be a PUBLISHER to edit your games',
  })
  @ApiUnprocessableEntityResponse({
    description: 'Internal error while saving content',
  })
  @Patch(':id')
  @Roles([Role.ROLE_ADMIN, Role.ROLE_PUBLISHER])
  update(
    @ActiveSession() user: UserSession,
    @Param('id', ParseIntPipe) gameid: number,
    @Body(new ValidationPipe()) updateGameDto: UpdateGameDTO,
  ) {
    return this.gamesService.update(user.userid, gameid, updateGameDto);
  }
}
