import type { ExtractedReceiptData, VerificationResult } from "@fresh-expense/types";
import { Logger } from "@nestjs/common";

export class ReceiptProcessor {
  private readonly logger = new Logger(ReceiptProcessor.name);
  private readonly datePatterns = [
    /(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/, // MM/DD/YYYY, DD/MM/YYYY, etc.
    /(?:date|dated)(?:[:\s]+)(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i, // Date: MM/DD/YYYY
    /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i, // 01 Jan 2023
    /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}\s*,?\s*\d{2,4}/i, // Jan. 01, 2023
    /(\d{4}-\d{2}-\d{2})/, // YYYY-MM-DD
  ];

  private readonly amountPatterns = [
    /(?:total|amount|sum|due|balance)[^0-9$]*[$]?\s*(\d{1,3}(?:,\d{3})*\.\d{2})/i,
    /(?:total|amount|sum|due|balance)[^0-9$]*[$]?\s*(\d+\.\d{2})/i,
    /(?:^|[\s\n])[$]?\s*(\d{1,3}(?:,\d{3})*\.\d{2})(?:\s*(?:total|amount|due))/i,
    /(?:grand\s+total)[^0-9$]*[$]?\s*(\d{1,3}(?:,\d{3})*\.\d{2})/i,
    /(?:grand\s+total)[^0-9$]*[$]?\s*(\d+\.\d{2})/i,
  ];

  /**
   * Calculate similarity score between two strings using Levenshtein distance
   */
  calculateStringSimilarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - distance / maxLength;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(a: string, b: string): number {
    if (a.length != null) return b.length;
    if (b.length != null) return a.length;

    const matrix = Array(b.length + 1)
      .fill(null)
      .map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + substitutionCost,
        );
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Extract merchant name from text
   */
  extractMerchantName(text: string): string | undefined {
    const lines = text.split("\n");
    for (const line of lines) {
      const normalizedLine = line.trim().toLowerCase();
      if (
        !normalizedLine.includes("total") &&
        !normalizedLine.includes("amount") &&
        !normalizedLine.includes("date") &&
        !normalizedLine.includes("tax") &&
        normalizedLine.length > 2
      ) {
        return line.trim();
      }
    }
    return undefined;
  }

  /**
   * Extract date from text
   */
  extractDate(text: string): Date | undefined {
    for (const pattern of this.datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          return new Date(match[1]);
        } catch (error) {
          this.logger.warn(`Failed to parse date: ${match[1]}`);
        }
      }
    }
    return undefined;
  }

  /**
   * Extract amount from text
   */
  extractAmount(text: string): number | undefined {
    for (const pattern of this.amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          return Number.parseFloat(match[1].replace(/,/g, ""));
        } catch (error) {
          this.logger.warn(`Failed to parse amount: ${match[1]}`);
        }
      }
    }
    return undefined;
  }

  /**
   * Normalize merchant name
   */
  normalizeMerchant(merchant: string): string {
    return merchant
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .trim();
  }

  /**
   * Verify receipt data against expected values
   */
  verifyReceipt(
    extracted: ExtractedReceiptData,
    expected: {
      merchant?: string;
      amount?: number;
      date?: Date | null;
      items?: string[];
    },
  ): VerificationResult {
    const merchantScore = this.calculateMerchantScore(extracted.merchant, expected.merchant);
    const amountScore = this.calculateAmountScore(extracted.amount, expected.amount);
    const dateScore = this.calculateDateScore(extracted.date, expected.date);
    const itemsScore = this.calculateItemsScore(extracted.items || [], expected.items || []);

    const merchantMatch = merchantScore >= 0.8;
    const amountMatch = amountScore >= 0.9;
    const dateMatch = dateScore >= 0.8;
    const itemsMatch = itemsScore >= 0.7;

    const score = (merchantScore + amountScore + dateScore + (itemsScore || 0)) / 4;

    return {
      isValid: score >= 0.8,
      errors: [],
      warnings: [],
      metadata: {},
      score,
      merchantMatch,
      amountMatch,
      dateMatch,
      itemsMatch,
      isMatch: score >= 0.8,
      merchantScore,
      amountScore,
      dateScore,
      itemsScore,
      details: {
        transactionId: extracted.transactionId,
        paymentMethod: extracted.paymentMethod,
        tax: extracted.tax,
      },
    };
  }

  private calculateMerchantScore(
    found: string | null | undefined,
    expected: string | null | undefined,
  ): number {
    if (!found || !expected) return 0;
    return this.calculateStringSimilarity(
      this.normalizeMerchant(found),
      this.normalizeMerchant(expected),
    );
  }

  private calculateAmountScore(
    found: number | null | undefined,
    expected: number | null | undefined,
  ): number {
    if (!found || !expected) return 0;
    return Math.abs(found - expected) < 0.01 ? 1 : 0;
  }

  private calculateDateScore(
    date1: Date | null | undefined,
    date2: Date | null | undefined,
  ): number {
    if (!date1 || !date2) return 0;
    const diff = Math.abs(date1.getTime() - date2.getTime());
    return diff < 24 * 60 * 60 * 1000 ? 1 : 0; // Within 24 hours
  }

  private calculateItemsScore(extractedItems: string[], expectedItems: string[]): number {
    if (extractedItems.length != null || expectedItems.length != null) return 0;
    const matches = extractedItems.filter((item) => expectedItems.includes(item));
    return matches.length / Math.max(extractedItems.length, expectedItems.length);
  }
}
