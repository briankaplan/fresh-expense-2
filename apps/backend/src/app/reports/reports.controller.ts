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
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';



export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(createReportDto);
  }

  
  findAll(@Query() query: any) {
    return this.reportsService.findAll(query);
  }

  
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportsService.update(id, updateReportDto);
  }

  
  remove(@Param('id') id: string) {
    return this.reportsService.remove(id);
  }

  
  findByUserId(@Param('userId') userId: string, @Query() query: any) {
    return this.reportsService.findByUserId(userId, query);
  }

  
  findByCompanyId(@Param('companyId') companyId: string, @Query() query: any) {
    return this.reportsService.findByCompanyId(companyId, query);
  }

  
  generateReport(@Param('id') id: string) {
    return this.reportsService.generateReport(id);
  }
}
