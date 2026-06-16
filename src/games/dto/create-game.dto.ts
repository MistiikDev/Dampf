import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateGameDTO {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  retail_price: number;

  @IsNumber()
  @IsNotEmpty()
  publisher_id: number;
}