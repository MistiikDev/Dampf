import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Request,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse, ApiBearerAuth,
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
import { ActiveSession, UserSession } from '../core/decorators/activeSession.decorator';

@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  // POST /billing/purchase
  // START A PURCHASE PROCESS FOR THE CURRENT LOGGED USER

  @ApiBearerAuth('access-token')
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
    @ActiveSession() user: UserSession,
    @Body(new ValidationPipe()) purchaseDTO: CreatePurchaseDTO,
  ): Promise<boolean> {
    return this.billingService.processPurchase(user.userid, purchaseDTO);
  }
}
