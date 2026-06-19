import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserService } from '../user/user.service';
import { UserPrivateEntity } from '../user/entity/user-private.entity';

import { GamesService } from '../games/games.service';
import { GamePurchaseEntity } from './entity/game-purchase.entity';

import { CreatePurchaseDTO } from '../core/dto/purchase.dto';
import { GenericSuccessResponseDTO } from '../core/dto/generic-success-response.dto';
import { BalanceResponseDTO } from '../core/dto/balance.dto';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(GamePurchaseEntity)
    private userGamePurchaseRepository: Repository<GamePurchaseEntity>,

    private userService: UserService,
    private gameService: GamesService,
  ) {}

  private readonly giftCardIdToBalance = {
    1: 5,
    2: 10,
    3: 20,
    4: 50,
    5: 100,
  };

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

    const userPrivate: UserPrivateEntity = user.private;

    if (game.retail_price > userPrivate.balance) {
      throw new HttpException(
        {
          message: 'Balance insufficient',
        },
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

  async rechargeUserBalance(
    userid: string,
    giftCardId: number,
  ): Promise<GenericSuccessResponseDTO> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    if (
      giftCardId == null ||
      !Object.keys(this.giftCardIdToBalance).includes(giftCardId.toString())
    ) {
      throw new BadRequestException('Gift Card ID is not recognized');
    }

    const giftCardAmount = this.giftCardIdToBalance[giftCardId];

    /*
      Process Payment Method, confirmation, security ... here
    */

    const isSuccess = await this.userService.addUserBalance(
      userid,
      giftCardAmount,
    );

    return {
      success: isSuccess,
    };
  }

  async getUserBalance(userid: string): Promise<BalanceResponseDTO> {
    const user = await this.userService.findEntry(
      { userid: userid },
      { private: true },
    );

    return {
      balance: user.private.balance,
    };
  }
}
