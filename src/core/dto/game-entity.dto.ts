import { ApiProperty } from '@nestjs/swagger';

export class GameEntityResponseDTO {
  @ApiProperty()
  gameid: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  retail_price: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}