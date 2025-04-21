import { Receipt } from "@fresh-expense/types";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, Types } from "mongoose";

import type { IReceipt } from "../../models/receipt.model";
import type { R2Service } from "../r2/r2.service";

interface CreateReceiptDto {
  file: Buffer;
  filename: string;
  mimeType: string;
  merchant: string;
  amount: number;
  userId: string;
  transactionId?: string;
}

interface UpdateReceiptDto {
  merchant?: string;
  amount?: number;
  transactionId?: string;
}

@Injectable()
export class ReceiptService {
  constructor(
    @InjectModel("Receipt") private receiptModel: Model<IReceipt>,
    private r2Service: R2Service,
  ) {}

  async create(dto: CreateReceiptDto): Promise<IReceipt> {
    const r2Key = this.r2Service.generateKey(dto.userId, dto.filename);
    const r2ThumbnailKey = this.r2Service.generateThumbnailKey(r2Key);

    // Upload original file
    await this.r2Service.uploadReceipt(dto.file, r2Key, dto.mimeType);

    // Generate and upload thumbnail
    const thumbnail = await this.r2Service.generateThumbnail(dto.file);
    await this.r2Service.uploadReceipt(thumbnail, r2ThumbnailKey, "image/jpeg");

    // Get signed URLs
    const fullImageUrl = await this.r2Service.getSignedUrl(r2Key);
    const thumbnailUrl = await this.r2Service.getSignedUrl(r2ThumbnailKey);

    const receipt = new this.receiptModel({
      filename: dto.filename,
      thumbnailUrl,
      fullImageUrl,
      merchant: dto.merchant,
      amount: dto.amount,
      userId: new Types.ObjectId(dto.userId),
      transactionId: dto.transactionId ? new Types.ObjectId(dto.transactionId) : undefined,
      r2Key,
      r2ThumbnailKey,
      metadata: {
        mimeType: dto.mimeType,
        size: dto.file.length,
      },
    });

    return receipt.save();
  }

  async findById(id: string, userId: string): Promise<IReceipt> {
    const receipt = await this.receiptModel.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (!receipt) {
      throw new NotFoundException("Receipt not found");
    }

    // Update signed URLs
    receipt.fullImageUrl = await this.r2Service.getSignedUrl(receipt.r2Key);
    receipt.thumbnailUrl = await this.r2Service.getSignedUrl(receipt.r2ThumbnailKey);

    return receipt;
  }

  async findByUserId(userId: string, search?: string): Promise<IReceipt[]> {
    const query: any = { userId: new Types.ObjectId(userId) };

    if (search) {
      query.$text = { $search: search };
    }

    const receipts = await this.receiptModel.find(query).sort({ uploadDate: -1 }).exec();

    // Update all signed URLs
    for (const receipt of receipts) {
      receipt.fullImageUrl = await this.r2Service.getSignedUrl(receipt.r2Key);
      receipt.thumbnailUrl = await this.r2Service.getSignedUrl(receipt.r2ThumbnailKey);
    }

    return receipts;
  }

  async update(id: string, userId: string, dto: UpdateReceiptDto): Promise<IReceipt> {
    const receipt = await this.receiptModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      },
      {
        $set: {
          ...(dto.merchant && { merchant: dto.merchant }),
          ...(dto.amount && { amount: dto.amount }),
          ...(dto.transactionId && {
            transactionId: new Types.ObjectId(dto.transactionId),
          }),
        },
      },
      { new: true },
    );

    if (!receipt) {
      throw new NotFoundException("Receipt not found");
    }

    // Update signed URLs
    receipt.fullImageUrl = await this.r2Service.getSignedUrl(receipt.r2Key);
    receipt.thumbnailUrl = await this.r2Service.getSignedUrl(receipt.r2ThumbnailKey);

    return receipt;
  }

  async delete(id: string, userId: string): Promise<void> {
    const receipt = await this.receiptModel.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (!receipt) {
      throw new NotFoundException("Receipt not found");
    }

    // Delete files from R2
    await this.r2Service.deleteFile(receipt.r2Key);
    await this.r2Service.deleteFile(receipt.r2ThumbnailKey);

    // Delete from database
    await receipt.deleteOne();
  }
}
