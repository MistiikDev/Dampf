import { ApiProperty } from '@nestjs/swagger';

export class UserEntityResponseDTO {
  @ApiProperty()
  readonly userid: string;

  @ApiProperty()
  readonly username: string;

  @ApiProperty()
  readonly role: string;

  @ApiProperty({
    description:
      ' Array of Game Objects that the user owns | NULL on GET/user ',
  })
  readonly ownedGames: any[];

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;
}