import type { User } from "@fresh-expense/types";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Request as ExpressRequest } from "express";
import { JwtAuthGuard } from "../app/auth/guards/jwt-auth.guard";
import type { ReceiptService } from "../services/receipt/receipt.service";

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
    @Request() req: AuthenticatedRequest,
  ) {
    return this.receiptService.create({
      file: file.buffer,
      filename: file.originalname,
      mimeType: file.mimetype,
      merchant: body.merchant,
      amount: Number.parseFloat(body.amount),
      userId: req.user._id.toString(),
      transactionId: body.transactionId,
    });
  }

  async getReceipts(@Query("search") search: string, @Request() req: AuthenticatedRequest) {
    return this.receiptService.findByUserId(req.user._id.toString(), search);
  }

  async getReceipt(@Param("id") id: string, @Request() req: AuthenticatedRequest) {
    return this.receiptService.findById(id, req.user._id.toString());
  }

  async updateReceipt(
    @Param("id") id: string,
    @Body() body: Partial<ReceiptBody>,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.receiptService.update(id, req.user._id.toString(), {
      merchant: body.merchant,
      amount: body.amount ? Number.parseFloat(body.amount) : undefined,
      transactionId: body.transactionId,
    });
  }

  async deleteReceipt(@Param("id") id: string, @Request() req: AuthenticatedRequest) {
    await this.receiptService.delete(id, req.user._id.toString());
    return { success: true };
  }
}
