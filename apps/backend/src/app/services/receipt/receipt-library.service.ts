import type { ReceiptDocument } from "@fresh-expense/types";
import { Injectable, Logger } from "@nestjs/common";
import type { MerchantService } from "./merchant.service";
import type { ReceiptMatcherService } from "./receipt-matcher.service";
import type { SubscriptionService } from "./subscription.service";

interface LibraryReceipt {
  receipt: ReceiptDocument;
  status: "matched" | "unmatched" | "pending";
  transactionId?: string;
  matchConfidence?: number;
}

@Injectable()
export class ReceiptLibraryService {
  private readonly logger = new Logger(ReceiptLibraryService.name);

  constructor(
    private readonly receiptMatcher: ReceiptMatcherService,
    private readonly merchantService: MerchantService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async addReceiptToLibrary(receipt: ReceiptDocument): Promise<LibraryReceipt> {
    try {
      // 1. Find potential matches
      const matches = await this.receiptMatcher.findMatchesForReceipt(receipt);
      const bestMatch = matches[0];

      // 2. Update merchant database
      await this.merchantService.updateMerchantFromReceipt(receipt);

      // 3. Check for subscriptions
      await this.subscriptionService.checkForSubscriptions(receipt);

      // 4. Create library entry
      const libraryReceipt: LibraryReceipt = {
        receipt,
        status: bestMatch?.confidence >= 0.8 ? "matched" : "unmatched",
        transactionId: bestMatch?.transactionId,
        matchConfidence: bestMatch?.confidence,
      };

      // 5. If matched, update transaction with receipt URL
      if (libraryReceipt.status === "matched" && libraryReceipt.transactionId) {
        await this.updateTransactionWithReceipt(libraryReceipt.transactionId, receipt.r2Key);
      }

      return libraryReceipt;
    } catch (error) {
      this.logger.error("Error adding receipt to library:", error);
      throw error;
    }
  }

  async findUnmatchedReceipts(): Promise<LibraryReceipt[]> {
    try {
      // TODO: Implement query for unmatched receipts
      return [];
    } catch (error) {
      this.logger.error("Error finding unmatched receipts:", error);
      throw error;
    }
  }

  async matchPendingReceipts(): Promise<void> {
    try {
      const unmatchedReceipts = await this.findUnmatchedReceipts();

      for (const libraryReceipt of unmatchedReceipts) {
        const matches = await this.receiptMatcher.findMatchesForReceipt(libraryReceipt.receipt);

        if (matches[0]?.confidence >= 0.8) {
          await this.updateTransactionWithReceipt(
            matches[0].transactionId,
            libraryReceipt.receipt.r2Key,
          );
        }
      }
    } catch (error) {
      this.logger.error("Error matching pending receipts:", error);
      throw error;
    }
  }

  private async updateTransactionWithReceipt(
    transactionId: string,
    receiptKey: string,
  ): Promise<void> {
    // TODO: Implement transaction update
    // This should:
    // 1. Find transaction by ID
    // 2. Update receipt URL
    // 3. Save transaction
  }
}
