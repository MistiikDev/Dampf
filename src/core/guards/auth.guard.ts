import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Request } from 'express';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

import { Public } from '../decorators/ispublic.decorator';
import { CRequest } from '../types/request.type';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride(Public, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    try {
      const request: CRequest = context.switchToHttp().getRequest();
      const token: string | undefined = this.extractTokenFromHeader(request);

      if (token != undefined) {
        request.user = await this.jwtService.verifyAsync(token);
      } else {
        throw new ForbiddenException(
          'You need to be logged in to access this ressource',
        );
      }

      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token expired');
      }

      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(req: Request): string | undefined {
    // Authorization: Bearer 1464vfsdefv == Auth: TYPE TOKEN
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
