import { Controller, Get, Post, Body, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDTO } from './dto/login-user.dto';
import { Public } from './decorators/ispublic.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // GET auth/login
  @Post('login')
  @Public()
  login(@Body() loginUserDTO: LoginUserDTO) {
    return this.authService.login(loginUserDTO.username, loginUserDTO.password);
  }

  @Get('profile')
  findOne(@Request() req: Request): any {
    return this.authService.getProfile(req);
  }
}
