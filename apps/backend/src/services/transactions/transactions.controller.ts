import type { TransactionSchema } from "@/core/database/schemas/transaction.schema";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import { ApiResponse } from "@fresh-expense/types";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import type { CreateTransactionDto } from "./dto/create-transaction.dto";
import type { TransactionsService } from "./transactions.service";

export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  async getTransactions(@CurrentUser("id") userId: string): Promise<TransactionSchema[]> {
    return this.transactionsService.getTransactions(userId);
  }

  async getTransactionById(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
  ): Promise<TransactionSchema | null> {
    return this.transactionsService.getTransactionById(id);
  }

  async createTransaction(
    @CurrentUser("id") userId: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionSchema> {
    return this.transactionsService.createTransaction({
      ...createTransactionDto,
      userId,
    });
  }

  async updateTransaction(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body() update: Partial<TransactionSchema>,
  ): Promise<{ success: boolean }> {
    const success = await this.transactionsService.updateTransaction(id, update);
    return { success };
  }

  async deleteTransaction(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
  ): Promise<{ success: boolean }> {
    const success = await this.transactionsService.deleteTransaction(id);
    return { success };
  }
}
