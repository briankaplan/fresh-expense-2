import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import type { StatsService } from "../services/stats/stats.service";

export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  async getHealthCheck() {
    return this.statsService.getHealthCheck();
  }

  async getDashboardStats() {
    return this.statsService.getDashboardStats();
  }

  async getExpenseDetails(@Param("id") id: string) {
    return this.statsService.getExpenseDetails(id);
  }
}
