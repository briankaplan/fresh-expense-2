import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OCRService } from '../../services/ocr/ocr.service';

@Controller('ocr')
export class OCRController {
  constructor(private readonly ocrService: OCRService) {}

  @Post('receipt')
  @UseInterceptors(FileInterceptor('receipt'))
  async processReceipt(@UploadedFile() file: Express.Multer.File) {
    const result = await this.ocrService.processImage(file.buffer);
    const extractedData = await this.ocrService.extractReceiptData(result.text.join('\n'));
    
    return {
      rawOcr: result,
      extractedData
    };
  }
} 