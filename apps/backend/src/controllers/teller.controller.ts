import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import type { TellerAccount, TellerQuery, TellerService } from "../services/teller/teller.service";
import type { TellerSyncTask } from "../tasks/teller-sync.task";

export class TellerController {
  private readonly logger = new Logger(TellerController.name);

  constructor(
    private readonly tellerService: TellerService,
    private readonly tellerSyncTask: TellerSyncTask,
  ) {}

  async getAccounts(): Promise<TellerAccount[]> {
    try {
      return await this.tellerService.getAccounts();
    } catch (error) {
      throw new HttpException("Failed to fetch Teller accounts", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async syncTransactions() {
    try {
      return await this.tellerSyncTask.manualSync();
    } catch (error) {
      throw new HttpException("Failed to sync transactions", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async syncHistoricalTransactions() {
    try {
      this.logger.log("Starting historical transaction sync from January 2024");
      await this.tellerService.syncAllAccounts(true);
      return { message: "Historical sync completed successfully" };
    } catch (error) {
      throw new HttpException(
        "Failed to sync historical transactions",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTransactions(
    @Query("accountId") accountId?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("limit") limit = "100",
    @Query("offset") offset = "0",
  ) {
    try {
      if (!accountId) {
        throw new HttpException("Account ID is required", HttpStatus.BAD_REQUEST);
      }

      const query: TellerQuery = {
        from: startDate,
        to: endDate,
        count: Number.parseInt(limit),
        offset: Number.parseInt(offset),
      };

      const [transactions, total] = await Promise.all([
        this.tellerService.getTransactions(accountId, query),
        this.tellerService.countTransactions(query),
      ]);

      return {
        transactions,
        total,
        limit: Number.parseInt(limit),
        offset: Number.parseInt(offset),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException("Failed to fetch transactions", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
