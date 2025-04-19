import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';
import { User } from '@fresh-expense/types';

interface ExpenseQuery {
  startDate?: string;
  endDate?: string;
  category?: string;
  status?: string;
  minAmount?: string;
  maxAmount?: string;
}

interface AuthenticatedRequest extends ExpressRequest {
  user: User;
}



export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  
  create(@Body() createExpenseDto: CreateExpenseDto, @Request() req: AuthenticatedRequest) {
    return this.expensesService.create({
      ...createExpenseDto,
      userId: req.user._id.toString(),
    });
  }

  
  findAll(@Query() query: ExpenseQuery, @Request() req: AuthenticatedRequest) {
    return this.expensesService.findAll({
      ...query,
      userId: req.user._id.toString(),
    });
  }

  
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.expensesService.findOne(id);
  }

  
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @Request() req: AuthenticatedRequest
  ) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.expensesService.remove(id);
  }

  
  findByUserId(
    @Param('userId') userId: string,
    @Query() query: ExpenseQuery,
    @Request() req: AuthenticatedRequest
  ) {
    return this.expensesService.findByUserId(userId, query);
  }

  
  findByCompanyId(
    @Param('companyId') companyId: string,
    @Query() query: ExpenseQuery,
    @Request() req: AuthenticatedRequest
  ) {
    return this.expensesService.findByCompanyId(companyId, query);
  }

  
  getExpenseSummary(
    @Param('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req: AuthenticatedRequest
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }
    return this.expensesService.getExpenseSummary(userId, new Date(startDate), new Date(endDate));
  }
}
