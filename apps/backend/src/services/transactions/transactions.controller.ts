import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { TransactionSchema } from '../database/schemas/transaction.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@ApiTags('transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all transactions for the current user' })
  @ApiResponse({ status: 200, description: 'Returns all transactions', type: [TransactionSchema] })
  async getTransactions(@CurrentUser('id') userId: string): Promise<TransactionSchema[]> {
    return this.transactionsService.getTransactions(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Returns the transaction', type: TransactionSchema })
  async getTransactionById(
    @CurrentUser('id') userId: string,
    @Param('id') id: string
  ): Promise<TransactionSchema | null> {
    return this.transactionsService.getTransactionById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully', type: TransactionSchema })
  async createTransaction(
    @CurrentUser('id') userId: string,
    @Body() createTransactionDto: CreateTransactionDto
  ): Promise<TransactionSchema> {
    return this.transactionsService.createTransaction({
      ...createTransactionDto,
      userId,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully', type: TransactionSchema })
  async updateTransaction(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() update: Partial<TransactionSchema>
  ): Promise<{ success: boolean }> {
    const success = await this.transactionsService.updateTransaction(id, update);
    return { success };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction deleted successfully' })
  async deleteTransaction(
    @CurrentUser('id') userId: string,
    @Param('id') id: string
  ): Promise<{ success: boolean }> {
    const success = await this.transactionsService.deleteTransaction(id);
    return { success };
  }
} 