import { Controller, Get, Post, Body, Request } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginUserDTO, LoginUserResponseDTO } from '../core/dto/login-user.dto';
import { Public } from '../core/decorators/ispublic.decorator';
import {
  ActiveSession,
  UserSession,
} from '../core/decorators/activeSession.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // GET /auth/login
  // LOGIN INTO ACCOUNT

  @ApiBearerAuth('access-token')
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

  // GET /auth/profile
  // RETURN USER PROFILE FROM CURRENT ACTIVE SESSION

  @ApiBearerAuth('access-token')
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
  findOne(@ActiveSession() user: UserSession): any {
    return user;
  }
}
