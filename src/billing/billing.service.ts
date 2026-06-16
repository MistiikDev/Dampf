import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';

import { CreatePurchaseDTO } from '../core/dto/purchase.dto';
import { UserService } from '../user/user.service';
import { GamesService } from '../games/games.service';

@Injectable()
export class BillingService {
  constructor(
    private userService: UserService,
    private gameService: GamesService,
  ) {}

  async processPurchase(
    userid: number,
    purchaseDTO: CreatePurchaseDTO,
  ): Promise<boolean> {
    const user = await this.userService.findOne(userid);
    const game = await this.gameService.findOne(purchaseDTO.productid);

    if (!user || !game) {
      throw new BadRequestException();
    }

    if (game.retail_price > user.balance) {
      throw new NotAcceptableException('Balance insufficient');
    }
    // TRY to set game to user db
    // THEN retract price from user balance

    return false;
  }
}
