import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { TransactionService } from '../services/transaction/transaction.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';



export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  
  async getTransactions(@Query() query: any) {
    return this.transactionService.getTransactions(query);
  }

  
  async getTransactionById(@Param('id') id: string) {
    return this.transactionService.getTransactionById(id);
  }

  
  async syncTransactions(@Body() options: any) {
    return this.transactionService.syncTransactions(options);
  }

  
  async matchTransactionWithReceipt(
    @Param('id') transactionId: string,
    @Body('receiptId') receiptId: string
  ) {
    return this.transactionService.matchTransactionWithReceipt(transactionId, receiptId);
  }

  
  async unmatchTransaction(@Param('id') transactionId: string) {
    return this.transactionService.unmatchTransaction(transactionId);
  }
}
