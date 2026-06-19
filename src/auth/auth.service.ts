import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
      throw new HttpException(
        `User ${username} does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }

    const userPrivate: UserPrivateEntity = user.private;
    const isMatch = await bcrypt.compare(password, userPrivate.password);
    if (!isMatch) {
      throw new HttpException(`Credentials error`, HttpStatus.FORBIDDEN);
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
      throw new HttpException('Cannot read cookie', HttpStatus.BAD_REQUEST);
    }

    const payload: UserSession = await this.jwtService.verifyAsync(
      refresh_token,
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      },
    );

    const freshUser = await this.userService.findEntry({
      userid: payload.userid,
    });

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
