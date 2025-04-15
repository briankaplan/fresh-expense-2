import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { Report, ReportDocument, ReportType, ReportFormat } from './schemas/report.schema';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

interface ReportQuery {
  userId?: string;
  companyId?: string;
  type?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(@InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>) {}

  async create(createReportDto: CreateReportDto): Promise<ReportDocument> {
    const createdReport = new this.reportModel(createReportDto);
    return createdReport.save();
  }

  async findAll(query: ReportQuery = {}): Promise<ReportDocument[]> {
    return this.reportModel.find(query).exec();
  }

  async findOne(id: string): Promise<ReportDocument> {
    const report = await this.reportModel.findById(id).exec();
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  async update(id: string, updateReportDto: UpdateReportDto): Promise<ReportDocument> {
    const report = await this.reportModel
      .findByIdAndUpdate(id, updateReportDto, { new: true })
      .exec();
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  async remove(id: string): Promise<void> {
    const result = await this.reportModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
  }

  async findByUserId(userId: string, query: ReportQuery = {}): Promise<ReportDocument[]> {
    return this.reportModel.find({ userId, ...query }).exec();
  }

  async findByCompanyId(companyId: string, query: ReportQuery = {}): Promise<ReportDocument[]> {
    return this.reportModel.find({ companyId, ...query }).exec();
  }

  async generateReport(id: string): Promise<ReportDocument> {
    const report = await this.findOne(id);

    try {
      // Update status to processing
      await this.update(id, { status: 'processing' } as UpdateReportDto);

      // Generate report based on type
      let summary;
      switch (report.type) {
        case ReportType.EXPENSE:
          summary = await this.generateExpenseReport(report);
          break;
        case ReportType.CATEGORY:
          summary = await this.generateCategoryReport(report);
          break;
        case ReportType.MERCHANT:
          summary = await this.generateMerchantReport(report);
          break;
        case ReportType.SUBSCRIPTION:
          summary = await this.generateSubscriptionReport(report);
          break;
        case ReportType.TAX:
          summary = await this.generateTaxReport(report);
          break;
      }

      // Generate file based on format
      const fileUrl = await this.generateReportFile(report, summary);

      // Update report with results
      return this.update(id, {
        status: 'completed',
        summary,
        fileUrl,
      } as UpdateReportDto);
    } catch (error) {
      await this.update(id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      } as UpdateReportDto);
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processScheduledReports() {
    const scheduledReports = await this.reportModel
      .find({
        isScheduled: true,
        status: { $ne: 'processing' },
      })
      .exec();

    for (const report of scheduledReports) {
      await this.generateReport(report._id.toString());
    }
  }

  private async generateExpenseReport(report: Report) {
    // Implementation for expense report generation
    return {
      totalAmount: 0,
      count: 0,
      byCategory: [],
      byMerchant: [],
      byDate: [],
    };
  }

  private async generateCategoryReport(report: Report) {
    // Implementation for category report generation
    return {
      totalAmount: 0,
      count: 0,
      byCategory: [],
    };
  }

  private async generateMerchantReport(report: Report) {
    // Implementation for merchant report generation
    return {
      totalAmount: 0,
      count: 0,
      byMerchant: [],
    };
  }

  private async generateSubscriptionReport(report: Report) {
    // Implementation for subscription report generation
    return {
      totalAmount: 0,
      count: 0,
      bySubscription: [],
    };
  }

  private async generateTaxReport(report: Report) {
    // Implementation for tax report generation
    return {
      totalAmount: 0,
      count: 0,
      byTaxCategory: [],
    };
  }

  private async generateReportFile(report: ReportDocument, summary: any): Promise<string> {
    // Implementation for file generation based on format
    return 'https://example.com/reports/' + report._id + '.' + report.format;
  }
}
