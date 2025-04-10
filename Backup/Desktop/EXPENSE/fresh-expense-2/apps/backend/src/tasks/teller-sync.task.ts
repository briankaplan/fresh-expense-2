import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TellerService } from '../services/teller/teller.service';

@Injectable()
export class TellerSyncTask {
  private readonly logger = new Logger(TellerSyncTask.name);

  constructor(private readonly tellerService: TellerService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async syncTransactions() {
    this.logger.log('Starting daily Teller transaction sync');
    
    try {
      await this.tellerService.syncAllAccounts();
      this.logger.log('Daily Teller transaction sync completed successfully');
    } catch (error) {
      this.logger.error('Error during daily Teller transaction sync:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Manual sync endpoint for testing
  async manualSync() {
    this.logger.log('Starting manual Teller transaction sync');
    await this.tellerService.syncAllAccounts();
    return { message: 'Manual sync completed' };
  }
} 