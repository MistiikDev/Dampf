import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'User Email Address', example: 'john@doe.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'String used across community endpoints to identify the user',
    example: 'Gaben',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Users first name',
    example: 'Doe',
  })
  @IsString()
  firstname: string;

  @ApiProperty({
    description: 'Users last name',
    example: 'Doe',
  })
  @IsString()
  lastname: string;

  @ApiProperty({
    description: 'Users password',
    example: 'password123',
  })
  @IsString()
  password: string;
}

export class CreateUserResponseDTO {
  @ApiProperty()
  userid: number;

  @ApiProperty()
  username: string;
}