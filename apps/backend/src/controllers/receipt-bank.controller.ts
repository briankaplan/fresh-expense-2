import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import type { Model } from "mongoose";

import { CurrentUser } from "@/shared/decorators/current-user.decorator";

import type { ReceiptDocument } from "../models/receipt.model";
import type { ReceiptBankService } from "../services/receipt/receipt-bank.service";


export class ReceiptBankController {
  constructor(
    private readonly receiptBankService: ReceiptBankService,
    @InjectModel("Receipt") private receiptModel: Model<ReceiptDocument>,
  ) {}

  async uploadReceipts(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() userId: string,
  ) {
    if (!files || files.length != null) {
      throw new BadRequestException("No files uploaded");
    }

    const results = await Promise.all(
      files.map((file) =>
        this.receiptBankService.processNewReceipt(
          file.buffer,
          userId,
          file.mimetype,
          file.originalname,
        ),
      ),
    );

    return {
      message: `Successfully processed ${results.length} receipts`,
      receipts: results,
    };
  }

  async uploadReceipt(@UploadedFile() file: Express.Multer.File, @CurrentUser() userId: string) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    const receipt = await this.receiptBankService.processNewReceipt(
      file.buffer,
      userId,
      file.mimetype,
      file.originalname,
    );

    return {
      message: "Receipt processed successfully",
      receipt,
    };
  }

  async getReceipts(
    @CurrentUser() userId: string,
    @Query("search") search?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("status") status?: "unmatched" | "matched" | "processing",
    @Query("category") category?: string,
    @Query("limit") limit = "50",
    @Query("offset") offset = "0",
  ) {
    const query: any = { userId };

    if (search) {
      query.$text = { $search: search };
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    const receipts = await this.receiptBankService.findReceipts(query, {
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
    });

    return receipts;
  }

  async getReceipt(@Param("id") id: string, @CurrentUser() userId: string) {
    return this.receiptBankService.findReceiptById(id, userId);
  }

  async deleteReceipt(@Param("id") id: string, @CurrentUser() userId: string) {
    await this.receiptBankService.deleteReceipt(id, userId);
    return { message: "Receipt deleted successfully" };
  }

  async findMatches(@Param("id") id: string, @CurrentUser() userId: string) {
    const matches = await this.receiptBankService.findMatchesForReceiptById(id, userId);
    return {
      message: `Found ${matches.length} potential matches`,
      matches,
    };
  }

  async linkToTransaction(
    @Param("id") id: string,
    @Body("transactionId") transactionId: string,
    @CurrentUser() userId: string,
  ) {
    await this.receiptBankService.linkReceiptToTransactionById(id, transactionId, userId);
    return { message: "Receipt linked to transaction successfully" };
  }
}
