import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import type { OCRService } from "../services/ocr/ocr.service";

export class OCRController {
  constructor(private readonly ocrService: OCRService) {}

  async processReceipt(@UploadedFile() file: Express.Multer.File) {
    const result = await this.ocrService.processImage(file.buffer);
    const extractedData = await this.ocrService.extractReceiptData(result.text.join("\n"));

    return {
      rawOcr: result,
      extractedData,
    };
  }
}
