import { JwtService } from '@nestjs/jwt';
import { Role } from '../../roles/roles.enum';

const jwtService = new JwtService({
  secret: '123456789',
});

const token = jwtService.sign({
  userid: 1,
  username: 'admin',
  role: Role.ROLE_ADMIN,
});

console.log(token);
