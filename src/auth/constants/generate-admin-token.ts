import { JwtService } from '@nestjs/jwt';
import { jwtSecret } from './auth.secrets';
import { Role } from '../../roles/roles.enum'

const jwtService = new JwtService({
  secret: jwtSecret,
});

const token = jwtService.sign({
  userid: 1,
  username: 'admin',
  role: Role.ROLE_ADMIN,
});

console.log(token);
