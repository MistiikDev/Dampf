import { ApiProperty } from '@nestjs/swagger';

export class UserEntityResponseDTO {
  @ApiProperty()
  userid: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  role: string;

  @ApiProperty({
    description:
      ' Array of Game Objects that the user owns | NULL on GET/user ',
  })
  ownedGames: any[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}