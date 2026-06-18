import 'dotenv/config';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { UserModule } from '../user/user.module';

const configService = new ConfigService();

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: configService.getOrThrow<string>('JWT_SECRET'),
      signOptions: { expiresIn: '10m' },
    }),
  ],
  controllers: [AuthController],

  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
