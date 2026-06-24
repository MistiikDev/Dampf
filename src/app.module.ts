import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GamesModule } from './games/games.module';
import { RolesModule } from './roles/roles.module';
import { BillingModule } from './billing/billing.module';

import { typeOrmAsyncConfig } from '../config/typeorm.config';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    AuthModule,
    UserModule,
    GamesModule,
    RolesModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
  ],
})
export class AppModule {}
