import * as bcrypt from 'bcrypt';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../user/user.service';
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
    const user = await this.userService.findEntry(
      {
        username: username,
      },
      { private: true },
    );

    if (!user) {
      throw new NotFoundException(`User ${username} does not exist`);
    }

    const userPrivate: UserPrivateEntity = user.private;
    const isMatch = await bcrypt.compare(password, userPrivate.password);
    if (!isMatch) {
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
