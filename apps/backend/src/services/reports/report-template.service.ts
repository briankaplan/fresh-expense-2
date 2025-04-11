import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';

interface ReportTemplate {
  id: string;
  userId: Types.ObjectId;
  name: string;
  description?: string;
  type: 'expense' | 'receipt' | 'custom';
  format: 'pdf' | 'csv' | 'excel';
  filters: {
    dateRange?: {
      type: 'fixed' | 'relative';
      start?: Date | string;
      end?: Date | string;
      relativePeriod?: 'week' | 'month' | 'quarter' | 'year';
    };
    categories?: string[];
    merchants?: string[];
    minAmount?: number;
    maxAmount?: number;
    tags?: string[];
    hasReceipt?: boolean;
    customFilters?: Record<string, any>;
  };
  groupBy?: ('date' | 'category' | 'merchant' | 'tag')[];
  sortBy?: {
    field: string;
    order: 'asc' | 'desc';
  };
  columns: {
    field: string;
    title: string;
    type: 'text' | 'number' | 'date' | 'currency' | 'boolean';
    format?: string;
    width?: number;
  }[];
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    timezone: string;
    recipients: string[];
  };
}

interface GeneratedReport {
  id: string;
  templateId: string;
  userId: string;
  generatedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileUrl?: string;
  error?: string;
}

type ReportTemplateDocument = Document & ReportTemplate;
type GeneratedReportDocument = Document & GeneratedReport;

@Injectable()
export class ReportTemplateService {
  private readonly logger = new Logger(ReportTemplateService.name);

  constructor(
    @InjectModel('ReportTemplate') private reportTemplateModel: Model<ReportTemplateDocument>,
    @InjectModel('GeneratedReport') private generatedReportModel: Model<GeneratedReportDocument>,
  ) {}

  async createTemplate(userId: string, template: Partial<ReportTemplate>): Promise<ReportTemplate> {
    try {
      const newTemplate = new this.reportTemplateModel({
        ...template,
        userId: new Types.ObjectId(userId),
      });
      return await newTemplate.save();
    } catch (error) {
      this.logger.error('Error creating report template:', error);
      throw error;
    }
  }

  async updateTemplate(
    userId: string,
    templateId: string,
    updates: Partial<ReportTemplate>
  ): Promise<ReportTemplate> {
    try {
      const template = await this.reportTemplateModel.findOneAndUpdate(
        { _id: new Types.ObjectId(templateId), userId: new Types.ObjectId(userId) },
        updates,
        { new: true }
      );

      if (!template) {
        throw new Error('Template not found');
      }

      return template;
    } catch (error) {
      this.logger.error('Error updating report template:', error);
      throw error;
    }
  }

  async deleteTemplate(userId: string, templateId: string): Promise<void> {
    try {
      const result = await this.reportTemplateModel.deleteOne({
        _id: new Types.ObjectId(templateId),
        userId: new Types.ObjectId(userId),
      });

      if (result.deletedCount === 0) {
        throw new Error('Template not found');
      }
    } catch (error) {
      this.logger.error('Error deleting report template:', error);
      throw error;
    }
  }

  async getTemplates(userId: string): Promise<ReportTemplate[]> {
    try {
      return await this.reportTemplateModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ name: 1 })
        .exec();
    } catch (error) {
      this.logger.error('Error fetching report templates:', error);
      throw error;
    }
  }

  async generateReport(userId: string, templateId: string): Promise<GeneratedReport> {
    try {
      const template = await this.reportTemplateModel.findOne({
        _id: new Types.ObjectId(templateId),
        userId: new Types.ObjectId(userId),
      });

      if (!template) {
        throw new Error('Template not found');
      }

      const report = new this.generatedReportModel({
        templateId: template._id,
        userId: new Types.ObjectId(userId),
        generatedAt: new Date(),
        status: 'pending',
      });

      await report.save();

      // Start async report generation
      this.processReport(report._id.toString(), template);

      return report;
    } catch (error) {
      this.logger.error('Error generating report:', error);
      throw error;
    }
  }

  private async processReport(reportId: string, template: ReportTemplateDocument): Promise<void> {
    try {
      await this.generatedReportModel.findByIdAndUpdate(reportId, {
        status: 'processing',
      });

      // TODO: Implement report generation logic based on template type and format
      // 1. Fetch data based on template filters
      // 2. Process and transform data
      // 3. Generate file in specified format
      // 4. Upload file and get URL
      // 5. Update report status and file URL

      await this.generatedReportModel.findByIdAndUpdate(reportId, {
        status: 'completed',
        fileUrl: 'TODO: Add generated file URL',
      });
    } catch (error) {
      this.logger.error('Error processing report:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      await this.generatedReportModel.findByIdAndUpdate(reportId, {
        status: 'failed',
        error: errorMessage,
      });
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledReports() {
    try {
      const now = new Date();
      const templates = await this.reportTemplateModel.find({
        'schedule.frequency': { $exists: true },
      });

      for (const template of templates) {
        if (this.shouldGenerateReport(template, now)) {
          await this.generateReport(template.userId.toString(), template._id.toString());
        }
      }
    } catch (error) {
      this.logger.error('Error processing scheduled reports:', error);
    }
  }

  private shouldGenerateReport(template: ReportTemplateDocument, now: Date): boolean {
    if (!template.schedule) return false;

    const { frequency, dayOfWeek, dayOfMonth, time, timezone } = template.schedule;
    const targetTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));

    // Check if it's the right time
    const [hours, minutes] = time.split(':').map(Number);
    if (targetTime.getHours() !== hours || targetTime.getMinutes() !== minutes) {
      return false;
    }

    switch (frequency) {
      case 'daily':
        return true;
      case 'weekly':
        return targetTime.getDay() === (dayOfWeek || 0);
      case 'monthly':
        return targetTime.getDate() === (dayOfMonth || 1);
      default:
        return false;
    }
  }
} 