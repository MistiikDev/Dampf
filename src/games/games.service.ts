import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateGameDTO, CreateGameResponseDTO } from './dto/create-game.dto';
import { UpdateGameDTO } from './dto/update-game.dto';

import { GameEntity } from './entity/game.entity';
import { UserService } from '../user/user.service';
import { GenericService } from '../core/generics/generic.service';
import { GenericSuccessResponseDTO } from '../core/generics/generic-success-response.dto';

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

  async update(
    userid: string,
    gameid: number,
    updateGameDto: UpdateGameDTO,
    isAdmin: boolean,
  ) {
    const target_game: GameEntity = await this.findEntry(
      { gameid: gameid },
      { publisher: true },
    );

    if (!target_game.publisher) {
      throw new NotFoundException(
        'Publisher has deleted his profile, game is archived!',
      );
    }

    // Only let user update if it is his OWN game
    if (userid == target_game.publisher.userid || isAdmin) {
      Object.assign(target_game, updateGameDto);

      await this.gameRepository.save(target_game);

      return updateGameDto;
    } else {
      throw new NotAcceptableException('You must be the owner of the game to edit it!');
    }
  }

  async delete(
    userid: string,
    gameid: number,
    isAdmin: boolean,
  ): Promise<GenericSuccessResponseDTO> {
    const target_game: GameEntity = await this.findEntry(
      { gameid: gameid },
      { publisher: true },
    );

    if (!isAdmin) {
      if (!target_game.publisher) {
        throw new NotFoundException(
          'Publisher has deleted his profile, game is archived!',
        );
      }

      if (userid != target_game.publisher.userid) {
        throw new NotAcceptableException(
          'You must be the owner of the game to delete it!',
        );
      }
    }

    await this.gameRepository.delete({ gameid: gameid });

    return {
      success: true,
    };
  }
}
