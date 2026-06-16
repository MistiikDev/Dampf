import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GameEntity } from './entity/game.entity';
import { GamePurchaseEntity } from '../billing/entity/game-purchase.entity';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([GameEntity, GamePurchaseEntity]),
  ],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
