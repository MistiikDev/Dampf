import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiPaymentRequiredResponse,
  ApiResponse,
} from '@nestjs/swagger';

import { BillingService } from './billing.service';

import { CreatePurchaseDTO } from '../core/dto/purchase.dto';

import {
  ActiveSession,
  UserSession,
} from '../core/decorators/activeSession.decorator';
import { GenericSuccessResponseDTO } from '../core/dto/generic-success-response.dto';
import { BalanceResponseDTO } from '../core/dto/balance.dto';

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
    type: GenericSuccessResponseDTO,
  })
  @ApiBadRequestResponse({
    description: 'You need to be logged in to process a purchase',
  })
  @ApiPaymentRequiredResponse({
    description: 'Insufficient balance',
  })
  @Post('purchase')
  async purchase(
    @ActiveSession() user: UserSession,
    @Body(new ValidationPipe()) purchaseDTO: CreatePurchaseDTO,
  ): Promise<GenericSuccessResponseDTO> {
    return this.billingService.processPurchase(user.userid, purchaseDTO);
  }

  // GET /billing/balance
  @ApiBearerAuth('access-token')
  @ApiOperation({ description: 'Check your balance' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved balance',
    type: BalanceResponseDTO,
  })
  @ApiForbiddenResponse({
    description: 'You need to be logged in to check your balance',
  })
  @Get('balance')
  async getBalance(@ActiveSession() user: UserSession) {
    return await this.billingService.getUserBalance(user.userid);
  }

  // POST /billing/balance/recharge
  // RECHARGE BALANCE FOR CURRENT LOGGED USER
  @ApiBearerAuth('access-token')
  @ApiOperation({ description: 'Recharge your balance' })
  @ApiResponse({
    status: 200,
    description: 'Successfully recharged balance',
    type: GenericSuccessResponseDTO,
  })
  @ApiForbiddenResponse({
    description: 'You need to be logged in to check your balance',
  })
  @Get('balance/recharge/:giftCardId')
  async rechargeBalance(
    @ActiveSession() user: UserSession,
    @Param('giftCardId', ParseIntPipe) giftCardId: number,
  ) {
    return await this.billingService.rechargeUserBalance(
      user.userid,
      giftCardId,
    );
  }
}
