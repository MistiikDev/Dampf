import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { UserService } from '../user/user.service';

import { UserPrivateEntity } from '../user/entity/user-private.entity';
import { UserSession } from '../core/decorators/activeSession.decorator';
import { LoginUserResponseDTO } from './dto/login-user.dto';
import { UserEntity } from '../user/entity/user.entity';
import * as timeString from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  private readonly configService: ConfigService = new ConfigService();
  private readonly THIRTYDAYS: number = 30 * 24 * 60 * 60 * 1000;

  private getFieldFromCookies<T>(
    req: Request,
    field: string,
    required: boolean,
  ): T {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const v: T = req.cookies[field];

    if (required && !v) {
      throw new BadRequestException(`Cannot read ${field} from cookies`);
    }

    return v;
  }

  private createUserSessionFromUser(user: UserEntity): UserSession {
    return {
      userid: user.userid,
      username: user.username,
      role: user.role,
    };
  }

  // Check if given password matches user private's hash
  private async areCredentialsValid(
    user: UserEntity,
    password: string,
  ): Promise<boolean> {
    const userPrivate: UserPrivateEntity = user.private;
    const isMatch = await bcrypt.compare(password, userPrivate.password);
    if (!isMatch) {
      throw new ForbiddenException(`Credentials error`);
    }

    return true;
  }

  // Create a new token from .env secret
  async signTokenFromUserSession(
    userSession: UserSession,
    secretKeyEnvName: string,
    expireDate: timeString.StringValue,
  ) {
    return await this.jwtService.signAsync(userSession, {
      secret: this.configService.getOrThrow<string>(secretKeyEnvName),
      expiresIn: expireDate,
    });
  }

  async getUserSessionFromToken(
    token: string,
    secretKey: string,
  ): Promise<UserSession> {
    return await this.jwtService.verifyAsync(token, {
      secret: this.configService.getOrThrow<string>(secretKey),
    });
  }

  // Encode token into HTTP Cookies into response
  encodeTokenInRequest(
    res: Response,
    token: string,
    maxAge: number | undefined,
    httpOnly: boolean | undefined,
  ): void {
    res.cookie('refresh-token', token, {
      maxAge: maxAge ?? this.THIRTYDAYS,
      httpOnly: httpOnly ?? true, // DEBUG only, set to TRUE on prod
    });
  }

  // If user already has a refresh token in use, black list it, and set a new one as active
  async updatePreviousUserRefreshToken(
    req: Request,
    user: UserEntity,
    refreshToken: string,
  ) {
    const refToken: string = this.getFieldFromCookies<string>(
      req,
      'refresh-token',
      false,
    );

    // Check if stored refresh token IS a token for current target user (maybe there were 2 different profiles logggin in on the same browser)
    const isPrevTokenForUser: boolean =
      refToken == null
        ? false
        : (await this.getUserSessionFromToken(refToken, 'JWT_REFRESH_SECRET'))
            .userid == user.userid;

    if (refToken && isPrevTokenForUser) {
      if (user.private.refresh_token_blacklist != null) {
        user.private.refresh_token_blacklist.push(refToken);
      } else {
        user.private.refresh_token_blacklist = [refToken];
      }
    }

    // Update the DB with the new token / updated black list
    user.private.refresh_token = refreshToken;
    await this.userService.savePrivateItem(user.private);
  }

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

    // Check credentials
    await this.areCredentialsValid(user, password);

    const userSession: UserSession = this.createUserSessionFromUser(user);

    // create user tokens based to payload
    const accessToken: string = await this.signTokenFromUserSession(
      userSession,
      'JWT_SECRET',
      '10m',
    );

    const refreshToken: string = await this.signTokenFromUserSession(
      userSession,
      'JWT_REFRESH_SECRET',
      '30d',
    );

    // update the previous refresh token to blacklist, send a new one
    await this.updatePreviousUserRefreshToken(req, user, refreshToken);
    this.encodeTokenInRequest(res, refreshToken, this.THIRTYDAYS, true);

    return {
      access_token: accessToken,
    };
  }

  async refresh(req: Request): Promise<LoginUserResponseDTO> {
    const refresh_token: string = this.getFieldFromCookies<string>(
      req,
      'refresh-token',
      true,
    );

    const payload: UserSession = await this.getUserSessionFromToken(
      refresh_token,
      'JWT_REFRESH_SECRET',
    );

    const freshUser = await this.userService.findEntry(
      {
        userid: payload.userid,
      },
      { private: true },
    );

    if (freshUser.private.refresh_token !== refresh_token) {
      throw new UnauthorizedException('Token do not match with user');
    }

    if (freshUser.private.refresh_token_blacklist?.includes(refresh_token)) {
      throw new UnauthorizedException('Token is expired');
    }

    const newPayload: UserSession = this.createUserSessionFromUser(freshUser);
    req['user'] = newPayload;

    const accessToken = await this.signTokenFromUserSession(
      newPayload,
      'JWT_SECRET',
      '10m',
    );
    return {
      access_token: accessToken,
    };
  }
}
