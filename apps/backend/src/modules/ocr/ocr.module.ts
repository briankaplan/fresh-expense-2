import { Module } from '@nestjs/common';
import { OCRController } from './ocr.controller';
import { OCRService } from '../../services/ocr/ocr.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  ],
  controllers: [OCRController],
  providers: [OCRService],
  exports: [OCRService],
})
export class OCRModule {}
