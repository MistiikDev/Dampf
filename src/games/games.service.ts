import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateGameDTO } from './dto/create-game.dto';
import { UpdateGameDTO } from './dto/update-game.dto';
import { UserPayload } from '../user/types/user.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameEntity } from './entity/game.entity';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(GameEntity)
    private gameRepository: Repository<GameEntity>,
  ) {}

  private games = [
    {
      gameid: 1,
      title: 'Counter-Strike',
      description: '5v5 Competitive Shooter',
      retail_price: 0,
      publisher_id: 3,
    },
    {
      gameid: 2,
      title: 'Half-Life',
      description: 'Story-Driven Puzzle Shooter',
      retail_price: 9.99,
      publisher_id: 3,
    },
    {
      gameid: 3,
      title: 'FIFA 22',
      description: 'The Original 2022 Football Game',
      retail_price: 69.99,
      publisher_id: 1,
    },
  ];

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
    const newGame = {
      gameid: this.games.length + 1,
      ...createGameDTO,
    };

    await this.gameRepository.save(newGame);

    return newGame;
  }

  async update(gameid: number, req: Request, updateGameDto: UpdateGameDTO) {
    const user: UserPayload = req['user'];
    const target_game = await this.gameRepository.findOne({
      where: { gameid: gameid },
    });

    if (user && user.userid == target_game?.publisher.userid) {
      Object.assign(target_game, updateGameDto);
      await this.gameRepository.save(target_game);
    }
  }
}
