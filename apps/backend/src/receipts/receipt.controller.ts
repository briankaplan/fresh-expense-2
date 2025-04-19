import type { Receipt } from "@fresh-expense/types";
import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { ReceiptService } from "./receipt.service";

export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  async uploadReceipt(
    @Param("transactionId") transactionId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Receipt> {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    return this.receiptService.uploadReceipt(file.buffer, file.originalname, transactionId);
  }

  async getReceipt(@Param("transactionId") transactionId: string): Promise<Receipt> {
    return this.receiptService.getReceipt(transactionId);
  }

  async deleteReceipt(@Param("transactionId") transactionId: string): Promise<void> {
    return this.receiptService.deleteReceipt(transactionId);
  }
}
