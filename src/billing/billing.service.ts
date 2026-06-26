import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserService } from '../user/user.service';

import { GamesService } from '../games/games.service';
import { GamePurchaseEntity } from './entity/game-purchase.entity';

import { CreatePurchaseDTO } from './dto/purchase.dto';
import { GenericSuccessResponseDTO } from '../core/generics/generic-success-response.dto';
import { BalanceResponseDTO } from './dto/balance.dto';
import { GameEntity } from '../games/entity/game.entity';
import { UserEntity } from '../user/entity/user.entity';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(GamePurchaseEntity)
    private userGamePurchaseRepository: Repository<GamePurchaseEntity>,

    private userService: UserService,
    private gameService: GamesService,
  ) {}

  private readonly giftCardIdToBalance = {
    1: 5.00,
    2: 10.00,
    3: 20.00,
    4: 50.00,
    5: 100.00,
  };

  async checkUserAlreadyOwnsLicense(user: UserEntity, game: GameEntity) {
    const doesExist: boolean = await this.userGamePurchaseRepository.exists({
      where: {
        user: { userid: user.userid },
        game: { gameid: game.gameid },
      },
    });

    if (doesExist) {
      throw new ForbiddenException(
        `${user.username} already owns a license for ${game.title}!`,
      );
    }
  }

  checkUserBalanceForPurchase(user: UserEntity, game: GameEntity): boolean {
    if (game.retail_price > user.private.balance) {
      throw new HttpException(
        {
          message: 'Balance insufficient',
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    return true;
  }

  async processPurchase(
    userid: string,
    purchaseDTO: CreatePurchaseDTO,
  ): Promise<GenericSuccessResponseDTO> {
    const user = await this.userService.findEntry(
      { userid: userid },
      { private: true, ownedGames: true },
    );
    const game = await this.gameService.findEntry({
      gameid: purchaseDTO.productid,
    });

    await this.checkUserAlreadyOwnsLicense(user, game);
    this.checkUserBalanceForPurchase(user, game);

    const GamePurchase = new GamePurchaseEntity();
    GamePurchase.user = user;
    GamePurchase.game = game;
    GamePurchase.purchase_date = new Date();

    await this.userService.addUserBalance(user.userid, -game.retail_price);

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

    const giftCardAmount: number = this.giftCardIdToBalance[giftCardId];

    /*
      Process Payment Method, confirmation, security ... here
    */

    return {
      success: await this.userService.addUserBalance(userid, giftCardAmount),
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
