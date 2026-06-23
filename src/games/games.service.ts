import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CreateGameDTO,
  CreateGameResponseDTO,
} from '../core/dto/create-game.dto';
import { UpdateGameDTO } from '../core/dto/update-game.dto';

import { GameEntity } from './entity/game.entity';
import { UserService } from '../user/user.service';
import { GenericService } from '../core/generics/generic.service';

@Injectable()
export class GamesService extends GenericService<GameEntity> {
  constructor(
    @InjectRepository(GameEntity)
    private gameRepository: Repository<GameEntity>,
    private userService: UserService,
  ) {
    super(gameRepository);
  }

  async create(userid: string, createGameDTO: CreateGameDTO) {
    const user = await this.userService.findEntry({ userid: userid });
    const game = this.gameRepository.create({
      ...createGameDTO,
      publisher: user,
    });

    try {
      const savedGame = await this.gameRepository.save(game);

      const response: CreateGameResponseDTO = {
        gameid: savedGame.gameid,
        publisherid: userid,
      };

      return response;
    } catch {
      // 99% a duplicate issue with TITLE { unique: true }
      throw new NotAcceptableException('Game must be original!');
    }
  }

  async update(userid: string, gameid: number, updateGameDto: UpdateGameDTO) {
    const target_game = await this.findEntry({ gameid: gameid });

    // Only let user update if it is his OWN game
    if (userid == target_game?.publisher.userid) {
      Object.assign(target_game, updateGameDto);

      await this.gameRepository.save(target_game);

      return updateGameDto;
    }
  }
}
