import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { R2Service } from '../storage/r2.service';
import { WorkerService } from '../workers/worker.service';
import { Receipt, Transaction } from '@fresh-expense/types';

@Injectable()
export class ReceiptProcessorService {
  private readonly logger = new Logger(ReceiptProcessorService.name);

  constructor(
    @InjectModel('Receipt') private receiptModel: Model<Receipt>,
    @InjectModel('Transaction') private transactionModel: Model<Transaction>,
    private readonly r2Service: R2Service,
    private readonly workerService: WorkerService
  ) {}

  async processReceipt(file: Express.Multer.File, company?: string): Promise<Receipt> {
    try {
      // Upload file to R2
      const uploadResult = await this.r2Service.uploadFile(file, {
        prefix: 'receipts',
        metadata: { company },
      });

      // Create receipt document
      const receipt = await this.receiptModel.create({
        filename: file.originalname,
        status: 'matched',
        url: uploadResult.url,
        company,
        uploadedAt: new Date(),
      });

      // Queue OCR processing
      await this.workerService.queueReceiptProcessing(receipt.id);

      return receipt;
    } catch (error) {
      this.logger.error(`Error processing receipt: ${error.message}`, error.stack);
      throw error;
    }
  }

  async processReceiptOCR(receiptId: string): Promise<void> {
    try {
      const receipt = await this.receiptModel.findById(receiptId);
      if (!receipt) throw new Error('Receipt not found');

      // Download file from R2
      const fileBuffer = await this.r2Service.downloadFile(receipt.url);

      // Process OCR
      const ocrResult = await this.workerService.processOCR(fileBuffer);

      // Update receipt with OCR data
      receipt.metadata = {
        date: ocrResult.date,
        amount: ocrResult.amount,
        merchant: ocrResult.merchant,
      };

      // Try to match with existing transactions
      const matchedTransaction = await this.matchTransaction(receipt);
      if (matchedTransaction) {
        receipt.transactionId = matchedTransaction.id;
        receipt.status = 'completed';
      } else {
        receipt.status = 'completed';
      }

      await receipt.save();
    } catch (error) {
      this.logger.error(
        `Error processing OCR for receipt ${receiptId}: ${error.message}`,
        error.stack
      );
      await this.receiptModel.findByIdAndUpdate(receiptId, { status: 'matched' });
      throw error;
    }
  }

  private async matchTransaction(receipt: Receipt): Promise<Transaction | null> {
    if (!receipt.metadata) return null;

    const { date, amount, merchant } = receipt.metadata;
    if (!date || !amount || !merchant) return null;

    // Find transactions within 24 hours of receipt date
    const startDate = new Date(date);
    startDate.setHours(startDate.getHours() - 24);
    const endDate = new Date(date);
    endDate.setHours(endDate.getHours() + 24);

    // Look for exact matches first
    const exactMatch = await this.transactionModel.findOne({
      date: { $gte: startDate, $lte: endDate },
      amount,
      merchant,
      receiptId: { $exists: false },
    });

    if (exactMatch) return exactMatch;

    // Look for fuzzy matches
    const fuzzyMatch = await this.transactionModel.findOne({
      date: { $gte: startDate, $lte: endDate },
      amount: { $gte: amount * 0.95, $lte: amount * 1.05 },
      merchant: { $regex: merchant, $options: 'i' },
      receiptId: { $exists: false },
    });

    return fuzzyMatch;
  }

  async linkReceiptToTransaction(receiptId: string, transactionId: string): Promise<Receipt> {
    const [receipt, transaction] = await Promise.all([
      this.receiptModel.findById(receiptId),
      this.transactionModel.findById(transactionId),
    ]);

    if (!receipt) throw new Error('Receipt not found');
    if (!transaction) throw new Error('Transaction not found');

    receipt.transactionId = transactionId;
    transaction.receiptId = receiptId;

    await Promise.all([receipt.save(), transaction.save()]);

    return receipt;
  }
}
