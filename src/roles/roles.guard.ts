import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { Role } from './roles.enum';
import { Roles } from '../core/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req_roles: Role[] = this.reflector.getAllAndOverride(Roles, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!req_roles || req_roles.length === 0) {
      return true;
    }

    const req: Request = context.switchToHttp().getRequest();
    const user_payload = req['user'];

    try {
      const user_roles: Role = user_payload.role;

      return req_roles.includes(user_roles);
    } catch {
      throw new UnauthorizedException();
    }
  }
}
