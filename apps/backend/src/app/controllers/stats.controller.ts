import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { StatsService } from '../services/stats/stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('health')
  async getHealthCheck() {
    return this.statsService.getHealthCheck();
  }

  @Get('dashboard')
  async getDashboardStats() {
    return this.statsService.getDashboardStats();
  }

  @Get('expense/:id')
  async getExpenseDetails(@Param('id') id: string) {
    return this.statsService.getExpenseDetails(id);
  }
}
