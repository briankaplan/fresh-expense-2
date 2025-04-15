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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';
import { User } from '../users/schemas/user.schema';

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

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto, @Request() req: AuthenticatedRequest) {
    return this.expensesService.create({
      ...createExpenseDto,
      userId: req.user._id.toString(),
    });
  }

  @Get()
  findAll(@Query() query: ExpenseQuery, @Request() req: AuthenticatedRequest) {
    return this.expensesService.findAll({
      ...query,
      userId: req.user._id.toString(),
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @Request() req: AuthenticatedRequest
  ) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.expensesService.remove(id);
  }

  @Get('user/:userId')
  findByUserId(
    @Param('userId') userId: string,
    @Query() query: ExpenseQuery,
    @Request() req: AuthenticatedRequest
  ) {
    return this.expensesService.findByUserId(userId, query);
  }

  @Get('company/:companyId')
  findByCompanyId(
    @Param('companyId') companyId: string,
    @Query() query: ExpenseQuery,
    @Request() req: AuthenticatedRequest
  ) {
    return this.expensesService.findByCompanyId(companyId, query);
  }

  @Get('summary/:userId')
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
