import 'dotenv/config';
import { Role } from '../../roles/roles.enum';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

const configService = new ConfigService();

const jwtService = new JwtService({
  secret: configService.getOrThrow('JWT_SECRET'),
});

const token = jwtService.sign({
  userid: 'b99dc4ee-96a6-43e2-9132-fb48cf57d8d5',
  username: 'admin',
  role: Role.ROLE_ADMIN,
});

console.log(token);
