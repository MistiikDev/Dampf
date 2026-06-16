import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { CreatePurchaseDTO } from './dto/purchase.dto';
import { UserService } from '../user/user.service';
import { GamesService } from '../games/games.service';

import { RuntimeException } from '@nestjs/core/errors/exceptions';

@Injectable()
export class BillingService {
  constructor(
    private userService: UserService,
    private gameService: GamesService,
  ) {}

  async processPurchase(purchaseDTO: CreatePurchaseDTO): Promise<void> {
    const user = await this.userService.findOne(purchaseDTO.userid);
    const game = await this.gameService.findOne(purchaseDTO.productid);

    if (!user || !game) {
      throw new BadRequestException();
    }

    if (game.retail_price > user.balance) {
      throw new NotAcceptableException('Balance insufficient');
    }
    // TRY to set game to user db
    // THEN retract price from user balance

    throw new RuntimeException();
  }
}
