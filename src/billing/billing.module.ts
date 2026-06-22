import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamePurchaseEntity } from './entity/game-purchase.entity';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { GamesModule } from '../games/games.module';
import { UserModule } from '../user/user.module';
import { BillingMiddleware } from './billing.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([GamePurchaseEntity]),
    GamesModule,
    UserModule,
  ],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BillingMiddleware).forRoutes('billing/purchase');
  }
}
