import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Request,
  Patch,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';

import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

import { Public } from '../core/decorators/ispublic.decorator';
import { Roles } from '../core/decorators/roles.decorator';
import { Role } from '../roles/roles.enum';

import { CreateGameDTO } from '../core/dto/create-game.dto';
import { UpdateGameDTO } from '../core/dto/update-game.dto';

import { GamesService } from './games.service';
import { GameEntity } from './entity/game.entity';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @ApiOperation({ summary: 'Retrieve information from all games' })
  @ApiResponse({
    status: 201,
    description: 'Successfully retreived games',
    type: Promise<GameEntity[]>,
  })
  @Get()
  @Public()
  findAll() {
    return this.gamesService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve information from a game by GAMEID' })
  @ApiResponse({
    status: 201,
    description: 'Successfully retreived game',
    type: Promise<GameEntity>,
  })
  @Get(':id')
  @Public()
  findOne(@Param('id', ParseIntPipe) gameid: number) {
    return this.gamesService.findOne(gameid);
  }

  @ApiOperation({ summary: 'Publish a game' })
  @ApiResponse({
    status: 201,
    description: 'Successfully published game',
    type: Promise<GameEntity>,
  })
  @ApiForbiddenResponse({
    description: 'You need to be a PUBLISHER to publish a game',
  })
  @ApiUnprocessableEntityResponse({
    description: 'Internal error while saving content',
  })
  @Post()
  @Roles([Role.ROLE_ADMIN, Role.ROLE_PUBLISHER])
  create(@Body(new ValidationPipe()) createGameDto: CreateGameDTO) {
    return this.gamesService.create(createGameDto);
  }

  // POST
  @ApiOperation({ summary: 'Edit a personal games information' })
  @ApiResponse({
    status: 201,
    description: 'Successfully published game',
    type: Promise<GameEntity>,
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
    @Param('id', ParseIntPipe) gameid: number,
    @Request() req: Request,
    @Body(new ValidationPipe()) updateGameDto: UpdateGameDTO,
  ) {
    return this.gamesService.update(gameid, req, updateGameDto);
  }
}
