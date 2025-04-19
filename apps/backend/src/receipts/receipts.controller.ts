import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReceiptProcessorService } from './receipt-processor.service';
import { Receipt } from '@fresh-expense/types';


export class ReceiptsController {
  constructor(private readonly receiptProcessorService: ReceiptProcessorService) {}

  
  
  async uploadReceipt(
    @UploadedFile() file: Express.Multer.File,
    @Query('company') company?: string
  ): Promise<Receipt> {
    return this.receiptProcessorService.processReceipt(file, company);
  }

  
  async getReceipts(
    @Query('company') company?: string,
    @Query('status') status?: string,
    @Query('transactionId') transactionId?: string
  ): Promise<Receipt[]> {
    const query: any = {};
    if (company) query.company = company;
    if (status) query.status = status;
    if (transactionId) query.transactionId = transactionId;

    return this.receiptProcessorService.getReceipts(query);
  }

  
  async getReceipt(@Param('id') id: string): Promise<Receipt> {
    return this.receiptProcessorService.getReceipt(id);
  }

  
  async linkReceipt(
    @Param('id') id: string,
    @Body('transactionId') transactionId: string
  ): Promise<Receipt> {
    return this.receiptProcessorService.linkReceiptToTransaction(id, transactionId);
  }
}
