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
}

export class CreateGameResponseDTO {
  @ApiProperty()
  @IsNumber()
  gameid: number;

  @ApiProperty()
  @IsNumber()
  publisherid: string;
}
