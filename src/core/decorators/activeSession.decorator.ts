import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '../../roles/roles.enum';
import { CRequest } from '../types/request.type';

export class UserSession {
  userid: string;
  username: string;
  role: Role;
}

export const ActiveSession = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req: CRequest = ctx.switchToHttp().getRequest();
    const userSession: UserSession = req.user;

    if (!userSession) {
      throw new UnauthorizedException(
        'An active session is required to access endpoint',
      );
    }

    return userSession;
  },
);
