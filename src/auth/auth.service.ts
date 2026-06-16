import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';


import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  getProfile(req: Request): any {
    return req['user'];
  }

  async login(
    username: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.userService.getUserByUsername(username);

    if (!user) {
      throw new NotFoundException(`User ${username} does not exist`);
    }

    // TODO : Need HASHING !!!!!
    if (user.password !== password) {
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
