import { ApiProperty } from '@nestjs/swagger';

export class GameEntityResponseDTO {
  @ApiProperty()
  readonly gameid: number;

  @ApiProperty()
  readonly title: string;

  @ApiProperty()
  readonly description: string;

  @ApiProperty()
  readonly retail_price: number;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;
}