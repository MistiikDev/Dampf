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

import { Public } from '../auth/decorators/ispublic.decorator';
import { Roles } from '../roles/decorators/roles.decorator';
import { Role } from '../roles/roles.enum';

import { CreateGameDTO } from './dto/create-game.dto';
import { GamesService } from './games.service';
import { UpdateGameDTO } from './dto/update-game.dto';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  @Public()
  findAll() {
    return this.gamesService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id', ParseIntPipe) gameid: number) {
    return this.gamesService.findOne(gameid);
  }

  @Post()
  @Roles([Role.ROLE_ADMIN, Role.ROLE_PUBLISHER])
  create(@Body(new ValidationPipe()) createGameDto: CreateGameDTO) {
    return this.gamesService.create(createGameDto);
  }

  // POST
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
