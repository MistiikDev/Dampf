import { ApiProperty } from '@nestjs/swagger';

export class BalanceResponseDTO {
  @ApiProperty()
  balance: number;
}
