import { Injectable } from '@nestjs/common';
import { R2Service } from '../storage/r2.service';
import { Receipt } from '@fresh-expense/types';

@Injectable()
export class ReceiptService {
  constructor(private readonly r2Service: R2Service) {}

  async uploadReceipt(file: Buffer, filename: string, transactionId: string): Promise<Receipt> {
    const key = `receipts/${transactionId}/${filename}`;
    const url = await this.r2Service.uploadFile(key, file, 'application/pdf');

    return {
      id: transactionId,
      url,
      filename,
      uploadDate: new Date(),
      status: 'pending',
      transactionId,
    };
  }

  async getReceipt(transactionId: string): Promise<Receipt> {
    const key = `receipts/${transactionId}`;
    const stream = await this.r2Service.getFile(key);

    // Convert stream to buffer for processing
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return {
      id: transactionId,
      url: this.r2Service.generatePresignedUrl(key),
      filename: `${transactionId}.pdf`,
      uploadDate: new Date(),
      status: 'processed',
      transactionId,
    };
  }

  async deleteReceipt(transactionId: string): Promise<void> {
    const key = `receipts/${transactionId}`;
    await this.r2Service.deleteFile(key);
  }

  async processReceipt(receipt: Receipt): Promise<Receipt> {
    // TODO: Implement receipt processing logic
    // This could include:
    // 1. OCR to extract text
    // 2. ML model to categorize expenses
    // 3. Data extraction for amount, date, merchant
    // 4. Validation against transaction data

    return {
      ...receipt,
      status: 'processed',
    };
  }
}
