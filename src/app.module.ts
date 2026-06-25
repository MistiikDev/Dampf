import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GamesModule } from './games/games.module';
import { RolesModule } from './roles/roles.module';
import { BillingModule } from './billing/billing.module';

import { ThrottlerGuard } from '@nestjs/throttler';

import { typeOrmAsyncConfig } from '../config/typeorm.config';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    AuthModule,
    UserModule,
    GamesModule,
    RolesModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 10 req/min
        limit: 10,
      },
    ]),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    BillingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
