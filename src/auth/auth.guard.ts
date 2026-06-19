import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Request } from 'express';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

import { Public } from '../core/decorators/ispublic.decorator';

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
      const request: Request = context.switchToHttp().getRequest();
      const token: string | undefined = this.extractTokenFromHeader(request);

      if (token != undefined) {
        const payload = await this.jwtService.verifyAsync(token)
          .catch((err) => {
            if (err instanceof TokenExpiredError) {
              console.log('expired');
              throw new HttpException('Token expired', HttpStatus.UNAUTHORIZED);
            }
          });

        request['user'] = payload;
      } else {
        return false;
      }

      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(req: Request): string | undefined {
    // Authorization: Bearer 1464vfsdefv == Auth: TYPE TOKEN
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
