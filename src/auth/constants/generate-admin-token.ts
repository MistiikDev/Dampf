import 'dotenv/config';
import { Role } from '../../roles/roles.enum';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

const configService = new ConfigService();

const jwtService = new JwtService({
  secret: configService.getOrThrow('JWT_SECRET'),
});

const token = jwtService.sign({
  userid: 0,
  username: 'admin',
  role: Role.ROLE_ADMIN,
});

console.log(token);
