import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GamesModule } from './games/games.module';
import { RolesModule } from './roles/roles.module';

import { UserEntity } from './user/entity/user.entity';
import { GameEntity } from './games/entity/game.entity';
import { GamePurchaseEntity } from './billing/entity/game-purchase.entity';
import { BillingController } from './billing/billing.controller';
import { BillingService } from './billing/billing.service';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    GamesModule,
    RolesModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'test_nest',
      entities: [UserEntity, GameEntity, GamePurchaseEntity],
      synchronize: true,
    }),
    BillingModule,
  ],
  controllers: [AppController, BillingController],
  providers: [AppService, BillingService],
})
export class AppModule {}
