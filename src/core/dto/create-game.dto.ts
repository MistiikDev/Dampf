import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGameDTO {
  @ApiProperty({ description: 'Title of the game', example: 'Deadlock' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Description of the game',
    example: 'MOBA Movement Shooter game',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description:
      'Price at which users can buy the game, can be set to 0 for F2P games',
    example: 69.99,
  })
  @IsNumber()
  @IsNotEmpty()
  retail_price: number;

  @ApiProperty({
    description: 'Publisher of the game, must point to a valid USERID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty({
    message:
      'Publisher ID must point to a valid user id with publishing rights!',
  })
  publisher_id: number;
}

export class CreateGameResponseDTO {
  @ApiProperty()
  @IsNumber()
  gameid: number;

  @ApiProperty()
  @IsNumber()
  publisherid: string;
}
