import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OCRService } from '../../services/ocr/ocr.service';

@Controller('ocr')
export class OCRController {
  constructor(private readonly ocrService: OCRService) {}

  @Post('process')
  @UseInterceptors(FileInterceptor('file'))
  async processReceipt(@UploadedFile() file: any) {
    return this.ocrService.processReceipt(file);
  }
}
