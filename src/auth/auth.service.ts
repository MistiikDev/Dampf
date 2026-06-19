import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { UserService } from '../user/user.service';

import { UserPrivateEntity } from '../user/entity/user-private.entity';
import { UserSession } from '../core/decorators/activeSession.decorator';
import { LoginUserResponseDTO } from '../core/dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  private readonly configService: ConfigService = new ConfigService();
  private readonly THIRTYDAYS: number = 30 * 24 * 60 * 60 * 1000;

  async login(
    username: string,
    password: string,
    req: Request,
    res: Response,
  ): Promise<{ access_token: string }> {
    const user = await this.userService.findEntry(
      {
        username: username,
      },
      {
        private: true,
      },
    );

    if (!user) {
      throw new NotFoundException(`User ${username} does not exist`);
    }

    const userPrivate: UserPrivateEntity = user.private;

    const isMatch = await bcrypt.compare(password, userPrivate.password);
    if (!isMatch) {
      throw new ForbiddenException(`Credentials error`);
    }

    const payload = {
      userid: user.userid,
      username: user.username,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: '10m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: '30d',
    });

    // If user already has a refresh token in use, black list it and regenerate one
    const refToken = req.cookies['refresh_token'];

    if (refToken) {
      userPrivate.refresh_token_blacklist.push(refToken);
      await this.userService.savePrivateItem(userPrivate);
    }

    userPrivate.refresh_token = refreshToken;

    res.cookie('refresh-token', refreshToken, {
      maxAge: this.THIRTYDAYS,
      httpOnly: false, // DEBUG only, set to TRUE on prod
    });

    return {
      access_token: accessToken,
    };
  }

  async refresh(req: Request): Promise<LoginUserResponseDTO> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const refresh_token = req.cookies['refresh-token'];

    if (!refresh_token) {
      throw new BadRequestException('Cannot read cookie');
    }

    const payload: UserSession = await this.jwtService.verifyAsync(
      refresh_token,
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      },
    );

    const freshUser = await this.userService.findEntry(
      {
        userid: payload.userid,
      },
      { private: true },
    );

    if (freshUser.private.refresh_token != refresh_token) {
      throw new UnauthorizedException('Token do not match with user');
    }

    if (freshUser.private.refresh_token_blacklist.includes(refresh_token)) {
      throw new UnauthorizedException('Token is expired');
    }

    const newPayload: UserSession = {
      userid: freshUser.userid,
      username: freshUser.username,
      role: freshUser.role,
    };

    req['user'] = newPayload;

    const accessToken = await this.jwtService.signAsync(newPayload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
    });

    return {
      access_token: accessToken,
    };
  }
}
