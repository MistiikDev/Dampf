import { ApiProperty } from '@nestjs/swagger';
import { TimestampEntity } from '../../core/generics/timestamp-entity.entity';

export class UserEntityResponseDTO extends TimestampEntity {
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
}
