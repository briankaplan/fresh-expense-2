import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import type { OCRService } from "../../services/ocr/ocr.service";

export class OCRController {
  constructor(private readonly ocrService: OCRService) {}

  async processReceipt(@UploadedFile() file: any) {
    return this.ocrService.processReceipt(file);
  }
}
