import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '../../roles/roles.enum';

export class UserSession {
  userid: number;
  username: string;
  role: Role;
}

export const ActiveSession = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req: Request = ctx.switchToHttp().getRequest();
    const userSession: UserSession = req['user'];

    if (!userSession) {
      throw new UnauthorizedException(
        'An active session is required to access endpoint',
      );
    }

    return userSession;
  },
);
