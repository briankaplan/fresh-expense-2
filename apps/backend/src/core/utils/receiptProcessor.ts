import { createHash } from "node:crypto";
import { Readable } from "node:stream";

import {
  HeadObjectCommand,
  PutObjectCommand,
  type PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { lookup } from "mime-types";
import fetch, { type Response } from "node-fetch";

interface UnifiedReceipt {
  merchant: string;
  date: string;
  total: number;
  items?: {
    description: string;
    amount: number;
    quantity?: number;
  }[];
  tax?: number;
  tip?: number;
  subtotal?: number;
  category?: string;
  paymentMethod?: string;
  currency?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

interface ReceiptProcessingResult {
  success: boolean;
  url?: string;
  error?: string;
  originalUrl: string;
  unifiedReceipt?: UnifiedReceipt;
  metadata?: {
    ocrConfidence?: number;
    processedAt: string;
    source: string;
  };
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint: process.env.R2_ENDPOINT || undefined,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export class ReceiptProcessor {
  private static readonly ALLOWED_MIME_TYPES = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/heic",
    "image/heif",
    "image/tiff",
  ]);

  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly DOWNLOAD_TIMEOUT = 30000; // 30 seconds
  private static readonly OCR_ENDPOINT = process.env.OCR_API_ENDPOINT || "";
  private static readonly OCR_API_KEY = process.env.OCR_API_KEY || "";

  private static async checkIfReceiptExists(
    key: string,
  ): Promise<{ exists: boolean; metadata?: any }> {
    try {
      const result = await s3Client.send(
        new HeadObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME || "",
          Key: key,
        }),
      );
      return {
        exists: true,
        metadata: result.Metadata,
      };
    } catch (error) {
      return { exists: false };
    }
  }

  private static async performOCR(
    buffer: Buffer,
    mimeType: string,
  ): Promise<UnifiedReceipt | null> {
    if (!ReceiptProcessor.OCR_ENDPOINT || !ReceiptProcessor.OCR_API_KEY) {
      return null;
    }

    try {
      const response = await fetch(ReceiptProcessor.OCR_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": mimeType,
          "X-API-Key": ReceiptProcessor.OCR_API_KEY,
        },
        body: buffer,
      });

      if (!response.ok) {
        throw new Error("OCR processing failed");
      }

      const result = await response.json();
      return ReceiptProcessor.normalizeOCRResult(result);
    } catch (error) {
      console.error("OCR processing error:", error);
      return null;
    }
  }

  private static normalizeOCRResult(ocrResult: any): UnifiedReceipt {
    // Implement normalization logic based on your OCR service's response format
    return {
      merchant: ocrResult.merchant_name || "",
      date: ocrResult.date || "",
      total: Number.parseFloat(ocrResult.total) || 0,
      items: ocrResult.items?.map((item: any) => ({
        description: item.description || "",
        amount: Number.parseFloat(item.amount) || 0,
        quantity: Number.parseInt(item.quantity) || 1,
      })),
      tax: Number.parseFloat(ocrResult.tax) || 0,
      tip: Number.parseFloat(ocrResult.tip) || 0,
      subtotal: Number.parseFloat(ocrResult.subtotal) || 0,
      paymentMethod: ocrResult.payment_method || "",
      currency: ocrResult.currency || "USD",
      location: {
        address: ocrResult.address || "",
        city: ocrResult.city || "",
        state: ocrResult.state || "",
        country: ocrResult.country || "",
        postalCode: ocrResult.postal_code || "",
      },
    };
  }

  private static getFileExtensionFromUrl(url: string, contentType?: string | null): string {
    // Try to get extension from URL first
    const urlExtension = url.split(".").pop()?.toLowerCase();
    if (urlExtension && urlExtension.length <= 4) {
      return urlExtension;
    }

    // Fall back to content-type
    if (contentType) {
      const ext = lookup(contentType);
      if (ext) return ext;
    }

    // Default to pdf if we can't determine the type
    return "pdf";
  }

  private static async downloadWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ReceiptProcessor.DOWNLOAD_TIMEOUT);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      return response;
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  private static validateContentType(contentType: string | null): boolean {
    if (!contentType) return false;
    return ReceiptProcessor.ALLOWED_MIME_TYPES.has(contentType.toLowerCase());
  }

  private static async streamToBuffer(
    stream: NodeJS.ReadableStream | ReadableStream<any>,
  ): Promise<Buffer> {
    let nodeStream: NodeJS.ReadableStream;

    // Check if it's a web ReadableStream by checking for getReader method
    if ("getReader" in stream) {
      const reader = (stream as ReadableStream<any>).getReader();
      nodeStream = new Readable({
        async read() {
          try {
            const { done, value } = await reader.read();
            if (done) {
              this.push(null);
            } else {
              this.push(value);
            }
          } catch (error) {
            this.emit("error", error);
            this.push(null);
          }
        },
      });
    } else {
      nodeStream = stream as NodeJS.ReadableStream;
    }

    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      nodeStream.on("data", (chunk: Buffer) => {
        if (Buffer.concat(chunks).length > ReceiptProcessor.MAX_FILE_SIZE) {
          const destroyableStream = nodeStream as { destroy?: () => void };
          if (typeof destroyableStream.destroy === "function") {
            destroyableStream.destroy();
          }
          reject(new Error("File size exceeds limit"));
          return;
        }
        chunks.push(chunk);
      });
      nodeStream.on("error", (error) => reject(error));
      nodeStream.on("end", () => resolve(Buffer.concat(chunks)));
    });
  }

  public static async processReceipt(url: string): Promise<ReceiptProcessingResult> {
    try {
      const hash = createHash("md5").update(url).digest("hex");
      const baseKey = `receipts/${hash}`;

      // Check if receipt already exists
      const { exists, metadata } = await ReceiptProcessor.checkIfReceiptExists(baseKey);
      if (exists && metadata?.unifiedReceipt) {
        return {
          success: true,
          url: `${process.env.R2_PUBLIC_URL}/${baseKey}`,
          originalUrl: url,
          unifiedReceipt: JSON.parse(metadata.unifiedReceipt),
          metadata: {
            ocrConfidence: Number.parseFloat(metadata.ocrConfidence || "0"),
            processedAt: metadata.processedAt || new Date().toISOString(),
            source: metadata.source || "cache",
          },
        };
      }

      // Download and process the receipt
      const response = await ReceiptProcessor.downloadWithTimeout(url);
      if (!response.ok) {
        throw new Error(`Failed to download receipt: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!ReceiptProcessor.validateContentType(contentType)) {
        throw new Error("Invalid file type");
      }

      const extension = ReceiptProcessor.getFileExtensionFromUrl(url, contentType);
      const finalKey = `${baseKey}.${extension}`;

      // Convert to buffer and perform OCR
      const buffer = await ReceiptProcessor.streamToBuffer(response.body as NodeJS.ReadableStream);
      const unifiedReceipt = await ReceiptProcessor.performOCR(
        buffer,
        contentType || "application/pdf",
      );

      // Upload to S3
      const putObjectParams: PutObjectCommandInput = {
        Bucket: process.env.R2_BUCKET_NAME || "",
        Key: finalKey,
        Body: buffer,
        ContentType: contentType || undefined,
        Metadata: {
          unifiedReceipt: unifiedReceipt ? JSON.stringify(unifiedReceipt) : "",
          processedAt: new Date().toISOString(),
          source: "ocr",
        },
      };

      await s3Client.send(new PutObjectCommand(putObjectParams));

      return {
        success: true,
        url: `${process.env.R2_PUBLIC_URL}/${finalKey}`,
        originalUrl: url,
        unifiedReceipt: unifiedReceipt || undefined,
        metadata: {
          processedAt: new Date().toISOString(),
          source: "ocr",
        },
      };
    } catch (error) {
      console.error("Error processing receipt:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        originalUrl: url,
      };
    }
  }

  public static async processReceiptBatch(urls: string[]): Promise<ReceiptProcessingResult[]> {
    return Promise.all(urls.map((url) => ReceiptProcessor.processReceipt(url)));
  }
}
