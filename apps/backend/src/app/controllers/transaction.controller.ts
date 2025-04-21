import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";

import type { TransactionService } from "../services/transaction/transaction.service";


export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  async getTransactions(@Query() query: any) {
    return this.transactionService.getTransactions(query);
  }

  async getTransactionById(@Param("id") id: string) {
    return this.transactionService.getTransactionById(id);
  }

  async syncTransactions(@Body() options: any) {
    return this.transactionService.syncTransactions(options);
  }

  async matchTransactionWithReceipt(
    @Param("id") transactionId: string,
    @Body("receiptId") receiptId: string,
  ) {
    return this.transactionService.matchTransactionWithReceipt(transactionId, receiptId);
  }

  async unmatchTransaction(@Param("id") transactionId: string) {
    return this.transactionService.unmatchTransaction(transactionId);
  }
}
