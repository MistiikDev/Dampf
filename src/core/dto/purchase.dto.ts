import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePurchaseDTO {
  @ApiProperty({
    description: 'Product ID from the product to purchase',
    example: '730',
  })
  @IsNotEmpty()
  productid: number;
}

export class CreatePurchaseResponseDTO {
  @ApiProperty({
    description:
      'Returns true or false whether the purchase has been processed or not',
    example: false,
  })
  success: boolean;
}