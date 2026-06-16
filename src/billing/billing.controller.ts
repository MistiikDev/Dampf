import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreatePurchaseDTO } from './dto/purchase.dto';

@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  // POST /billing/purchase

  @Post(':purchase')
  async purchase(
    @Body(new ValidationPipe()) purchaseDTO: CreatePurchaseDTO,
  ): Promise<void> {
    return this.billingService.processPurchase(purchaseDTO);
  }
}
