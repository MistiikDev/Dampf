import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Request,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { BillingService } from './billing.service';
import {
  CreatePurchaseDTO,
  CreatePurchaseResponseDTO,
} from '../core/dto/purchase.dto';

@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  // POST /billing/purchase

  @ApiOperation({ description: 'Process a purchase' })
  @ApiResponse({
    status: 201,
    description: 'Successfully processed purchase',
    type: CreatePurchaseResponseDTO,
  })
  @ApiBadRequestResponse({
    description: 'You need to be logged in to process a purchase',
  })
  @ApiNotAcceptableResponse({
    description: 'Insufficient balance',
  })
  @Post(':purchase')
  async purchase(
    @Request() req: Request,
    @Body(new ValidationPipe()) purchaseDTO: CreatePurchaseDTO,
  ): Promise<boolean> {
    const user = req['user'];
    if (!user) throw new BadRequestException();

    return this.billingService.processPurchase(user.userid, purchaseDTO);
  }
}
