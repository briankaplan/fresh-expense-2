import type { Receipt } from "@fresh-expense/types";
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import type { ReceiptProcessorService } from "./receipt-processor.service";

export class ReceiptsController {
  constructor(private readonly receiptProcessorService: ReceiptProcessorService) {}

  async uploadReceipt(
    @UploadedFile() file: Express.Multer.File,
    @Query("company") company?: string,
  ): Promise<Receipt> {
    return this.receiptProcessorService.processReceipt(file, company);
  }

  async getReceipts(
    @Query("company") company?: string,
    @Query("status") status?: string,
    @Query("transactionId") transactionId?: string,
  ): Promise<Receipt[]> {
    const query: any = {};
    if (company) query.company = company;
    if (status) query.status = status;
    if (transactionId) query.transactionId = transactionId;

    return this.receiptProcessorService.getReceipts(query);
  }

  async getReceipt(@Param("id") id: string): Promise<Receipt> {
    return this.receiptProcessorService.getReceipt(id);
  }

  async linkReceipt(
    @Param("id") id: string,
    @Body("transactionId") transactionId: string,
  ): Promise<Receipt> {
    return this.receiptProcessorService.linkReceiptToTransaction(id, transactionId);
  }
}
