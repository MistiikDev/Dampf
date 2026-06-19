import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Request } from 'express';
import { Reflector } from '@nestjs/core';

import { Role } from './roles.enum';
import { Roles } from '../core/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
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
      throw new ForbiddenException('Forbidden access denied for this action');
    }
  }
}
