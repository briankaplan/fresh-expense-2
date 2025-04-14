import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { TransactionService } from '../services/transaction/transaction.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async getTransactions(@Query() query: any) {
    return this.transactionService.getTransactions(query);
  }

  @Get(':id')
  async getTransactionById(@Param('id') id: string) {
    return this.transactionService.getTransactionById(id);
  }

  @Post('sync')
  async syncTransactions(@Body() options: any) {
    return this.transactionService.syncTransactions(options);
  }

  @Post(':id/match')
  async matchTransactionWithReceipt(
    @Param('id') transactionId: string,
    @Body('receiptId') receiptId: string
  ) {
    return this.transactionService.matchTransactionWithReceipt(transactionId, receiptId);
  }

  @Post(':id/unmatch')
  async unmatchTransaction(@Param('id') transactionId: string) {
    return this.transactionService.unmatchTransaction(transactionId);
  }
} 