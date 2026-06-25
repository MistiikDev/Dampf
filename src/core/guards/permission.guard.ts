import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

import { RequirePermission } from '../decorators/require-permission.decorator';
import { EnumPermissions } from '../../roles/permissions.enum';

import { Request } from 'express';
import { UserSession } from '../decorators/activeSession.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const reqPermissions: EnumPermissions[] = this.reflector.getAllAndOverride(
      RequirePermission,
      [context.getHandler(), context.getClass()],
    );

    const req: Request = context.switchToHttp().getRequest();
    const userPayload: UserSession = req['user'];
    const maxPermission: number = Math.max.apply(reqPermissions);

    return true;

    // return userPayload.permissions.includes(maxPermission);
  }
}
