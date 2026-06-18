import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CreateGameDTO,
  CreateGameResponseDTO,
} from '../core/dto/create-game.dto';
import { UpdateGameDTO } from '../core/dto/update-game.dto';

import { GameEntity } from './entity/game.entity';
import { UserService } from '../user/user.service';
import { Role } from '../roles/roles.enum';
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

  async create(userid: number, createGameDTO: CreateGameDTO) {
    const user = await this.userService.findEntry({ userid: userid });

    if (user.role === Role.ROLE_PLAYER) {
      throw new HttpException(
        'Publisher ID must point to a valid user with PUBLISHER permissions',
        HttpStatus.FORBIDDEN,
      );
    }

    const game = new GameEntity();
    game.title = createGameDTO.title;
    game.retail_price = createGameDTO.retail_price;
    game.description = createGameDTO.description;
    game.publisher = user;

    const savedGame = await this.gameRepository.save(game);

    const response: CreateGameResponseDTO = {
      gameid: savedGame.gameid,
      publisherid: savedGame.publisher.userid,
    };

    return response;
  }

  async update(userid: number, gameid: number, updateGameDto: UpdateGameDTO) {
    const target_game = await this.gameRepository.findOne({
      where: { gameid: gameid },
    });

    if (userid == target_game?.publisher.userid) {
      Object.assign(target_game, updateGameDto);

      await this.gameRepository.save(target_game);

      return updateGameDto;
    }
  }
}
