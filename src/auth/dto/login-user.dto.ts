import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDTO {
  @ApiProperty({ description: 'Profiles username', example: 'Gaben' })
  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty({ description: 'Profiles password', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}

export class LoginUserResponseDTO {
  @ApiProperty({
    description: 'Profiles JWT access token',
    example: '-d52A_CFtwQZ)cs587fP&ad',
  })
  readonly access_token: string;
}