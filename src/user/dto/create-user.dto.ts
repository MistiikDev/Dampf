import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'User Email Address', example: 'john@doe.com' })
  @IsEmail(undefined, { message: 'User Email Address is required' })
  readonly email: string;

  @ApiProperty({
    description: 'String used across community endpoints to identify the user',
    example: 'Gaben',
  })
  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty({
    description: 'Users first name',
    example: 'Doe',
  })
  @IsString()
  readonly firstname: string;

  @ApiProperty({
    description: 'Users last name',
    example: 'Doe',
  })
  @IsString()
  readonly lastname: string;

  @ApiProperty({
    description: 'Users password',
    example: 'password123',
  })
  @IsString()
  readonly password: string;
}

export class CreateUserResponseDTO {
  @ApiProperty()
  readonly userid: string;

  @ApiProperty()
  readonly username: string;
}