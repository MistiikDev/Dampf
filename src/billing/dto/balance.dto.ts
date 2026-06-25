import { ApiProperty } from '@nestjs/swagger';

export class BalanceResponseDTO {
  @ApiProperty()
  readonly balance: number;
}
