import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { TransactionSchema } from '@/core/database/schemas/transaction.schema';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ApiResponse } from '@fresh-expense/types';






export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  
  
  
  async getTransactions(@CurrentUser('id') userId: string): Promise<TransactionSchema[]> {
    return this.transactionsService.getTransactions(userId);
  }

  
  
  
  
  async getTransactionById(
    @CurrentUser('id') userId: string,
    @Param('id') id: string
  ): Promise<TransactionSchema | null> {
    return this.transactionsService.getTransactionById(id);
  }

  
  
  
  async createTransaction(
    @CurrentUser('id') userId: string,
    @Body() createTransactionDto: CreateTransactionDto
  ): Promise<TransactionSchema> {
    return this.transactionsService.createTransaction({
      ...createTransactionDto,
      userId,
    });
  }

  
  
  
  
  async updateTransaction(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() update: Partial<TransactionSchema>
  ): Promise<{ success: boolean }> {
    const success = await this.transactionsService.updateTransaction(id, update);
    return { success };
  }

  
  
  
  
  async deleteTransaction(
    @CurrentUser('id') userId: string,
    @Param('id') id: string
  ): Promise<{ success: boolean }> {
    const success = await this.transactionsService.deleteTransaction(id);
    return { success };
  }
}
