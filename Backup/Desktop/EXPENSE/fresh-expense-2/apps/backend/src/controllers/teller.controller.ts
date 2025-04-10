import { Controller, Get, Post, Query, UseGuards, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { TellerService, TellerAccount } from '../services/teller/teller.service';
import { TellerSyncTask } from '../tasks/teller-sync.task';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/teller')
@UseGuards(JwtAuthGuard)
export class TellerController {
  private readonly logger = new Logger(TellerController.name);

  constructor(
    private readonly tellerService: TellerService,
    private readonly tellerSyncTask: TellerSyncTask
  ) {}

  @Get('accounts')
  async getAccounts(): Promise<TellerAccount[]> {
    try {
      return await this.tellerService.getAccounts();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch Teller accounts',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('sync')
  async syncTransactions() {
    try {
      return await this.tellerSyncTask.manualSync();
    } catch (error) {
      throw new HttpException(
        'Failed to sync transactions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('sync/historical')
  async syncHistoricalTransactions() {
    try {
      this.logger.log('Starting historical transaction sync from January 2024');
      await this.tellerService.syncAllAccounts(true);
      return { message: 'Historical sync completed successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to sync historical transactions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('transactions')
  async getTransactions(
    @Query('accountId') accountId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit = '100',
    @Query('offset') offset = '0',
    @Query('minAmount') minAmount?: string,
    @Query('maxAmount') maxAmount?: string,
    @Query('category') category?: string
  ) {
    try {
      const query: any = {};
      
      if (accountId) {
        query.accountId = accountId;
      }
      
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      if (minAmount || maxAmount) {
        query.amount = {};
        if (minAmount) query.amount.$gte = parseFloat(minAmount);
        if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
      }

      if (category) {
        query.category = category;
      }

      const [transactions, total] = await Promise.all([
        this.tellerService.getTransactions(query, parseInt(limit), parseInt(offset)),
        this.tellerService.countTransactions(query)
      ]);

      return {
        transactions,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch transactions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 