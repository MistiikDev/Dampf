import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePurchaseDTO {
  @ApiProperty({
    description: 'Product ID from the product to purchase',
    example: '730',
  })
  @IsNotEmpty()
  readonly productid: number;
}