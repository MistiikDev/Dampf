import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateGameDTO } from '../core/dto/create-game.dto';
import { UpdateGameDTO } from '../core/dto/update-game.dto';

import { UserPayload } from '../user/types/user.types';
import { GameEntity } from './entity/game.entity';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(GameEntity)
    private gameRepository: Repository<GameEntity>,
  ) {}

  async findAll() {
    return await this.gameRepository.find();
  }

  async findOne(gameid: number) {
    const game = await this.gameRepository.findOne({
      where: { gameid: gameid },
    });

    if (game) {
      return game;
    }

    throw new NotFoundException(`Game ${game} not found.`);
  }

  async create(createGameDTO: CreateGameDTO) {
    const gameId = (await this.gameRepository.count()) + 1;

    const newGame = {
      gameid: gameId,
      ...createGameDTO,
    };

    await this.gameRepository
      .save(newGame)
      .then((game) => {
        return game;
      })
      .catch(() => {
        throw new NotAcceptableException('Internal error');
      });
  }

  async update(gameid: number, req: Request, updateGameDto: UpdateGameDTO) {
    const user: UserPayload = req['user'];
    const target_game = await this.gameRepository.findOne({
      where: { gameid: gameid },
    });

    if (user && user.userid == target_game?.publisher.userid) {
      Object.assign(target_game, updateGameDto);
      await this.gameRepository
        .save(target_game)
        .then((game) => {
          return game;
        })
        .catch(() => {
          throw new BadRequestException('Format error');
        });
    }
  }
}
