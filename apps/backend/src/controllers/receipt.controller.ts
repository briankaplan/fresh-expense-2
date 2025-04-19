import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../app/auth/guards/jwt-auth.guard';
import { ReceiptService } from '../services/receipt/receipt.service';
import { Request as ExpressRequest } from 'express';
import { User } from '@fresh-expense/types';

interface AuthenticatedRequest extends ExpressRequest {
  user: User;
}

interface ReceiptBody {
  merchant: string;
  amount: string;
  transactionId?: string;
}



export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  
  
  async uploadReceipt(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ReceiptBody,
    @Request() req: AuthenticatedRequest
  ) {
    return this.receiptService.create({
      file: file.buffer,
      filename: file.originalname,
      mimeType: file.mimetype,
      merchant: body.merchant,
      amount: parseFloat(body.amount),
      userId: req.user._id.toString(),
      transactionId: body.transactionId,
    });
  }

  
  async getReceipts(@Query('search') search: string, @Request() req: AuthenticatedRequest) {
    return this.receiptService.findByUserId(req.user._id.toString(), search);
  }

  
  async getReceipt(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.receiptService.findById(id, req.user._id.toString());
  }

  
  async updateReceipt(
    @Param('id') id: string,
    @Body() body: Partial<ReceiptBody>,
    @Request() req: AuthenticatedRequest
  ) {
    return this.receiptService.update(id, req.user._id.toString(), {
      merchant: body.merchant,
      amount: body.amount ? parseFloat(body.amount) : undefined,
      transactionId: body.transactionId,
    });
  }

  
  async deleteReceipt(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    await this.receiptService.delete(id, req.user._id.toString());
    return { success: true };
  }
}
