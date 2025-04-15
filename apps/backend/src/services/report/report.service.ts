import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as XLSX from 'xlsx';
import { ReportTemplate, ReportSchedule, Report } from './report.schema';
import { R2Service } from '../r2/r2.service';
import { ReceiptService } from '../receipt/receipt.service';
import { ExpenseService } from '../expense/expense.service';
import { PDFService } from '../pdf/pdf.service';
import { EmailService } from '../email/email.service';
import { Readable } from 'stream';

interface GenerateReportOptions {
  templateId: string;
  userId: string;
  startDate?: Date;
  endDate?: Date;
  categories?: string[];
  tags?: string[];
  status?: string[];
}

interface ReportCustomization {
  title: string;
  headers?: string[];
  groupBy?: string;
  sortBy?: string[];
  filters?: Record<string, any>;
  template?: string;
}

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    @InjectModel(ReportTemplate.name)
    private reportTemplateModel: Model<ReportTemplate>,
    @InjectModel(ReportSchedule.name)
    private reportScheduleModel: Model<ReportSchedule>,
    @InjectModel(Report.name)
    private reportModel: Model<Report>,
    private readonly r2Service: R2Service,
    private readonly receiptService: ReceiptService,
    private readonly expenseService: ExpenseService,
    private readonly pdfService: PDFService,
    private readonly emailService: EmailService
  ) {}

  async createTemplate(userId: string, template: Partial<ReportTemplate>) {
    try {
      const newTemplate = new this.reportTemplateModel({
        ...template,
        userId: new Types.ObjectId(userId),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await newTemplate.save();
      return newTemplate;
    } catch (error) {
      this.logger.error('Error creating report template:', error);
      throw error;
    }
  }

  async updateTemplate(userId: string, templateId: string, updates: Partial<ReportTemplate>) {
    try {
      const template = await this.reportTemplateModel.findOneAndUpdate(
        {
          _id: new Types.ObjectId(templateId),
          userId: new Types.ObjectId(userId),
        },
        {
          $set: {
            ...updates,
            updatedAt: new Date(),
          },
        },
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

  async scheduleReport(userId: string, templateId: string, schedule: Partial<ReportSchedule>) {
    try {
      const template = await this.reportTemplateModel.findOne({
        _id: new Types.ObjectId(templateId),
        userId: new Types.ObjectId(userId),
      });

      if (!template) {
        throw new Error('Template not found');
      }

      const newSchedule = new this.reportScheduleModel({
        ...schedule,
        templateId: template._id,
        userId: new Types.ObjectId(userId),
        status: 'scheduled',
        createdAt: new Date(),
      });

      await newSchedule.save();
      return newSchedule;
    } catch (error) {
      this.logger.error('Error scheduling report:', error);
      throw error;
    }
  }

  async generateReport(options: GenerateReportOptions) {
    try {
      const template = await this.reportTemplateModel.findOne({
        _id: new Types.ObjectId(options.templateId),
        userId: new Types.ObjectId(options.userId),
      });

      if (!template) {
        throw new Error('Template not found');
      }

      // Create a report record
      const report = new this.reportModel({
        templateId: template._id,
        userId: new Types.ObjectId(options.userId),
        status: 'running',
        createdAt: new Date(),
      });

      await report.save();

      try {
        // Fetch data based on report type
        let data;
        const queryOptions = {
          startDate: options.startDate,
          endDate: options.endDate,
          categories: options.categories,
          tags: options.tags,
          status: options.status,
        };

        switch (template.type) {
          case 'receipt':
            data = await this.receiptService.findByUserId(options.userId, queryOptions);
            break;
          case 'expense':
            data = await this.expenseService.findByUserId(options.userId, queryOptions);
            break;
          default:
            throw new Error('Unsupported report type');
        }

        // Generate report based on format
        let reportBuffer: Buffer;
        switch (template.format) {
          case 'pdf':
            const pdfStream = await this.pdfService.generateReport(data, {
              ...template.customization,
              title: template.name || 'Report',
              groupBy: Array.isArray(template.customization?.groupBy)
                ? template.customization.groupBy[0]
                : template.customization?.groupBy,
            });
            reportBuffer = await this.streamToBuffer(pdfStream as unknown as Readable);
            break;
          case 'csv':
            reportBuffer = await this.generateCSV(data, template.customization);
            break;
          case 'excel':
            reportBuffer = await this.generateExcel(data, template.customization);
            break;
          default:
            throw new Error('Unsupported report format');
        }

        // Upload to R2
        const { key, url } = await this.r2Service.uploadFile(
          reportBuffer,
          `reports/${report._id}.${template.format}`,
          `application/${template.format}`
        );

        // Update report record
        report.status = 'completed';
        report.completedAt = new Date();
        report.r2Key = key;
        report.downloadUrl = url;
        await report.save();

        // Send email if scheduled
        if (template.scheduling?.recipients?.length) {
          await this.emailService.sendReportEmail({
            to: template.scheduling.recipients,
            subject: `${template.name} Report`,
            reportUrl: url,
          });
        }

        return report;
      } catch (error: any) {
        // Update report status on error
        report.status = 'failed';
        report.error = error?.message || 'Unknown error occurred';
        await report.save();
        throw error;
      }
    } catch (error) {
      this.logger.error('Error generating report:', error);
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async processScheduledReports() {
    try {
      const now = new Date();
      const scheduledReports = await this.reportScheduleModel.find({
        status: 'scheduled',
        nextRun: { $lte: now },
        active: true,
      });

      for (const schedule of scheduledReports) {
        try {
          await this.generateReport({
            templateId: schedule.templateId.toString(),
            userId: schedule.userId.toString(),
          });

          // Update next run time
          schedule.lastRun = now;
          schedule.nextRun = this.calculateNextRun(schedule);
          await schedule.save();
        } catch (error) {
          this.logger.error(`Error processing scheduled report ${schedule._id}:`, error);
        }
      }
    } catch (error) {
      this.logger.error('Error processing scheduled reports:', error);
    }
  }

  private calculateNextRun(schedule: ReportSchedule): Date {
    const now = new Date();
    switch (schedule.frequency) {
      case 'daily':
        return new Date(now.setDate(now.getDate() + 1));
      case 'weekly':
        return new Date(now.setDate(now.getDate() + 7));
      case 'monthly':
        return new Date(now.setMonth(now.getMonth() + 1));
      default:
        return schedule.nextRun;
    }
  }

  private async generateCSV(data: any[], customization?: any): Promise<Buffer> {
    try {
      const headers = customization?.headers || Object.keys(data[0] || {});
      let csvContent = headers.join(',') + '\n';

      // Add data rows
      data.forEach(row => {
        const rowData = headers.map(header => {
          const value = row[header];
          // Handle special characters and commas in the value
          if (
            typeof value === 'string' &&
            (value.includes(',') || value.includes('"') || value.includes('\n'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        });
        csvContent += rowData.join(',') + '\n';
      });

      return Buffer.from(csvContent);
    } catch (error) {
      this.logger.error('Error generating CSV:', error);
      throw error;
    }
  }

  private async generateExcel(data: any[], customization?: any): Promise<Buffer> {
    try {
      const headers = customization?.headers || Object.keys(data[0] || {});
      const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });

      // Apply customization if provided
      worksheet['name'] = customization.sheetName;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, customization?.sheetName || 'Report');

      // Write to buffer
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      return Buffer.from(excelBuffer);
    } catch (error) {
      this.logger.error('Error generating Excel:', error);
      throw error;
    }
  }

  private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
      stream.on('error', error => reject(error));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  async markExpensesAsReported(userId: string, expenseIds: string[]) {
    try {
      const objectIds = expenseIds.map(id => new Types.ObjectId(id));

      // Update expenses to mark them as reported
      await this.expenseService.updateMany(
        {
          _id: { $in: objectIds },
          userId: new Types.ObjectId(userId),
        },
        {
          $set: {
            status: 'reported',
            reportedAt: new Date(),
          },
        }
      );

      return true;
    } catch (error) {
      this.logger.error('Error marking expenses as reported:', error);
      throw error;
    }
  }

  async getReportedExpenses(userId: string, filters: any = {}) {
    try {
      return await this.expenseService.findByUserId(userId, {
        ...filters,
        status: 'reported',
      });
    } catch (error) {
      this.logger.error('Error fetching reported expenses:', error);
      throw error;
    }
  }

  async updateReportedExpense(userId: string, expenseId: string, updates: any) {
    try {
      const expense = await this.expenseService.findOne({
        _id: new Types.ObjectId(expenseId),
        userId: new Types.ObjectId(userId),
        status: 'reported',
      });

      if (!expense) {
        throw new Error('Reported expense not found');
      }

      return await this.expenseService.updateOne(
        { _id: expense._id },
        { $set: { ...updates, updatedAt: new Date() } }
      );
    } catch (error) {
      this.logger.error('Error updating reported expense:', error);
      throw error;
    }
  }
}
