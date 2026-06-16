import { IsNotEmpty } from 'class-validator';

export class CreatePurchaseDTO {
  @IsNotEmpty()
  userid: number;

  @IsNotEmpty()
  productid: number;
}