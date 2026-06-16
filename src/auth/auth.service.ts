import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserPrivateEntity } from '../user/entity/user-private.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(
    username: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.userService.getUserBy({
      username: username,
    });

    if (!user) {
      throw new NotFoundException(`User ${username} does not exist`);
    }

    // TODO : Needs HASHING !!!!!
    const userPrivate: UserPrivateEntity = user.private;

    if (userPrivate.password !== password) {
      throw new UnauthorizedException(`Credentials error`);
    }

    const payload = {
      userid: user.userid,
      username: user.username,
      role: user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
