import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { StatsService } from '../services/stats/stats.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';



export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  
  async getHealthCheck() {
    return this.statsService.getHealthCheck();
  }

  
  async getDashboardStats() {
    return this.statsService.getDashboardStats();
  }

  
  async getExpenseDetails(@Param('id') id: string) {
    return this.statsService.getExpenseDetails(id);
  }
}
