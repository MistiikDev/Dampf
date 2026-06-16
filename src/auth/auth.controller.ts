import { Controller, Get, Post, Body, Request } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginUserDTO, LoginUserResponseDTO } from '../core/dto/login-user.dto';
import { Public } from '../core/decorators/ispublic.decorator';
import { UserPayload } from '../user/types/user.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // GET auth/login
  @ApiOperation({ summary: 'Login to a specific user' })
  @ApiResponse({
    status: 201,
    description: 'Successfully logged in',
    type: LoginUserResponseDTO,
  })
  @ApiForbiddenResponse({
    description: 'Credentials are not matching any profile',
  })
  @Post('login')
  @Public()
  login(@Body() loginUserDTO: LoginUserDTO) {
    return this.authService.login(loginUserDTO.username, loginUserDTO.password);
  }

  @ApiOperation({
    summary: 'Retrieve current profiles information, based on token headers',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully retrieved data',
  })
  @ApiForbiddenResponse({
    description: 'Header credentials are not matching any profile',
  })
  @ApiBadRequestResponse({
    description: 'No credentials specified',
  })
  @Get('profile')
  findOne(@Request() req: Request): any {
    return this.authService.getProfile(req);
  }
}
