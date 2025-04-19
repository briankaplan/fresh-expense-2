import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Report, ReportSchema } from './schemas/report.schema';


export class ReportsModule {}
