import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

import { CreatePurchaseDTO } from '../core/dto/purchase.dto';
import { UserService } from '../user/user.service';
import { GamesService } from '../games/games.service';
import { UserPrivateEntity } from '../user/entity/user-private.entity';
import { GamePurchaseEntity } from './entity/game-purchase.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GenericSuccessResponseDTO } from '../core/dto/generic-success-response.dto';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(GamePurchaseEntity)
    private userGamePurchaseRepository: Repository<GamePurchaseEntity>,

    private userService: UserService,
    private gameService: GamesService,
  ) {}

  async processPurchase(
    userid: string,
    purchaseDTO: CreatePurchaseDTO,
  ): Promise<GenericSuccessResponseDTO> {
    const user = await this.userService.findEntry(
      { userid: userid },
      { private: true },
    );
    const game = await this.gameService.findEntry({
      gameid: purchaseDTO.productid,
    });

    if (!user || !game) {
      throw new HttpException(
        'Error while processing purchase',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userPrivate: UserPrivateEntity = user.private;

    if (game.retail_price > userPrivate.balance) {
      throw new HttpException(
        'Balance insufficient',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    const GamePurchase = new GamePurchaseEntity();
    GamePurchase.user = user;
    GamePurchase.game = game;
    GamePurchase.purchase_date = new Date();

    await this.userService.addUserBalance(user.userid, -game.retail_price);

    // TRY to set game to user db
    // THEN retract price from user balance

    await this.userService.saveItem(user);
    await this.gameService.saveItem(game);

    await this.userGamePurchaseRepository.save(GamePurchase);

    return {
      success: true,
    };
  }
}
