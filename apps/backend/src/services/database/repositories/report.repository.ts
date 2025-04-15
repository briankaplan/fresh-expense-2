import { Filter, FindOptions } from 'mongodb';
import { MongoDBService } from '../mongodb.service';
import { BaseRepository } from './base.repository';
import { ReportSchema, REPORT_COLLECTION } from '../schemas/report.schema';

export class ReportRepository extends BaseRepository<ReportSchema> {
  protected readonly collectionName = REPORT_COLLECTION;

  constructor(mongoDBService: MongoDBService) {
    super(mongoDBService);
  }

  async findByUserId(userId: string): Promise<ReportSchema[]> {
    return this.find({ userId });
  }

  async findByType(userId: string, type: ReportSchema['type']): Promise<ReportSchema[]> {
    return this.find({ userId, type });
  }

  async findByStatus(userId: string, status: ReportSchema['status']): Promise<ReportSchema[]> {
    return this.find({ userId, status });
  }

  async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<ReportSchema[]> {
    return this.find({
      userId,
      'data.period.start': { $gte: startDate },
      'data.period.end': { $lte: endDate },
    });
  }

  async updateReportStatus(
    reportId: string,
    status: ReportSchema['status'],
    errorMessage?: string
  ): Promise<boolean> {
    return this.update(
      { _id: reportId },
      {
        $set: {
          status,
          errorMessage: status === 'failed' ? errorMessage : undefined,
        },
      }
    );
  }

  async updateReportData(reportId: string, data: ReportSchema['data']): Promise<boolean> {
    return this.update(
      { _id: reportId },
      {
        $set: { data },
      }
    );
  }

  async getLatestReport(userId: string): Promise<ReportSchema | null> {
    const reports = await this.find({ userId }, { sort: { 'data.period.end': -1 }, limit: 1 });
    return reports[0] || null;
  }

  async getReportsByPeriod(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ReportSchema[]> {
    return this.find({
      userId,
      'data.period.start': { $gte: startDate },
      'data.period.end': { $lte: endDate },
    });
  }
}
