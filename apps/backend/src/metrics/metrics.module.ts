import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { MetricsDocument, MetricsModel, MetricsSchema } from './metrics.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: MetricsModel.name, schema: MetricsSchema }])],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
