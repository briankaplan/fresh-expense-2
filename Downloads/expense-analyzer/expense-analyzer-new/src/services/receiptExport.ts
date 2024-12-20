'use client';

import { OCRData } from '@/types';
import sharp from 'sharp';
import JSZip from 'jszip';
import { Logger } from '@/utils/logger';

interface ImageExportOptions {
  format: 'jpg' | 'png';
  quality?: number;
  width?: number;
  height?: number;
  dpi?: number;
  enhanceReceipt?: boolean;
  compression?: {
    level: number;
    optimizeScans?: boolean;
  };
  metadata?: {
    includeOCR?: boolean;
    includeAudit?: boolean;
    includeHistory?: boolean;
  };
}

interface ReceiptExportMetadata {
  expenseId: string;
  lineNumber: number;
  merchant: string;
  date: string;
  amount: number;
  category?: string;
  reportReference?: {
    reportId: string;
    reportName: string;
    lineItem: number;
  };
  receiptNumber?: string;
  originalFilename: string;
  audit?: {
    processedAt: string;
    ocrConfidence: number;
    enhancementApplied: boolean;
    originalSize: number;
    processedSize: number;
    dpi: number;
  };
  history?: Array<{
    timestamp: string;
    action: string;
    details: Record<string, any>;
  }>;
}

interface BatchExportOptions extends ImageExportOptions {
  batchSize?: number;
  parallel?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  progressCallback?: (progress: {
    total: number;
    processed: number;
    failed: number;
    current: string;
  }) => void;
}

interface ExportResult {
  url: string;
  metadata: ReceiptExportMetadata;
  filename: string;
  stats?: {
    processingTime: number;
    originalSize: number;
    processedSize: number;
    compressionRatio: number;
  };
}

class ReceiptExportService {
  private readonly DEFAULT_OPTIONS: ImageExportOptions = {
    format: 'jpg',
    quality: 85,
    width: 1200,
    dpi: 300,
    enhanceReceipt: true,
    compression: {
      level: 9,
      optimizeScans: true
    },
    metadata: {
      includeOCR: true,
      includeAudit: true,
      includeHistory: true
    }
  };

  async processAndExportReceipt(
    receiptUrl: string,
    ocrData: OCRData,
    options: Partial<ImageExportOptions> = {}
  ): Promise<string> {
    const startTime = Date.now();
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };

    try {
      // Fetch and process image
      const { image, originalSize } = await this.fetchAndInitializeImage(receiptUrl);
      
      // Apply enhancements
      const enhancedImage = mergedOptions.enhanceReceipt ? 
        await this.enhanceReceipt(image) : 
        image;

      // Process image
      const processedImage = await this.processImage(enhancedImage, mergedOptions);
      
      // Add metadata
      const metadata = await this.generateMetadata(ocrData, {
        processedAt: new Date().toISOString(),
        originalSize,
        processedSize: processedImage.size,
        enhancementApplied: mergedOptions.enhanceReceipt,
        dpi: mergedOptions.dpi || 300
      });

      // Generate output
      const outputBuffer = await this.generateOutput(processedImage, metadata, mergedOptions);
      
      // Log processing metrics
      Logger.info('Receipt processed', {
        processingTime: Date.now() - startTime,
        originalSize,
        processedSize: outputBuffer.length,
        format: mergedOptions.format
      });

      return `data:image/${mergedOptions.format};base64,${outputBuffer.toString('base64')}`;

    } catch (error) {
      Logger.error('Failed to process receipt image:', error);
      throw new Error('Failed to process receipt image');
    }
  }

  private async fetchAndInitializeImage(url: string): Promise<{ 
    image: sharp.Sharp; 
    originalSize: number;
  }> {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return {
      image: sharp(Buffer.from(buffer)),
      originalSize: buffer.byteLength
    };
  }

  private async enhanceReceipt(image: sharp.Sharp): Promise<sharp.Sharp> {
    const stats = await image.stats();
    const { mean, std } = stats.channels[0];

    return image
      .grayscale()
      .linear(1.2, mean * -0.2)
      .threshold(mean + std * 0.5)
      .median(1)
      .sharpen({
        sigma: 1,
        m1: 0.5,
        m2: 0.5
      })
      .normalize();
  }

  private async processImage(
    image: sharp.Sharp,
    options: ImageExportOptions
  ): Promise<sharp.Sharp> {
    let processed = image
      .resize(options.width, options.height, {
        fit: 'inside',
        withoutEnlargement: true
      });

    if (options.format === 'jpg') {
      processed = processed.jpeg({
        quality: options.quality,
        chromaSubsampling: '4:4:4',
        force: true,
        optimizeScans: options.compression?.optimizeScans
      });
    } else {
      processed = processed.png({
        compressionLevel: options.compression?.level || 9,
        force: true
      });
    }

    return processed;
  }

  private async generateOutput(
    image: sharp.Sharp,
    metadata: ReceiptExportMetadata,
    options: ImageExportOptions
  ): Promise<Buffer> {
    return image
      .withMetadata({
        exif: {
          IFD0: metadata
        }
      })
      .toBuffer();
  }

  async exportBatch(
    receipts: Array<{
      url: string;
      ocrData: OCRData;
      expenseId: string;
      lineNumber: number;
      category?: string;
      reportReference?: {
        reportId: string;
        reportName: string;
        lineItem: number;
      };
    }>,
    options: BatchExportOptions = {}
  ): Promise<Array<ExportResult>> {
    const {
      batchSize = 5,
      parallel = true,
      maxRetries = 3,
      retryDelay = 1000,
      progressCallback
    } = options;

    const results: ExportResult[] = [];
    const failed: Array<{ receipt: typeof receipts[0]; error: Error }> = [];
    let processed = 0;

    for (let i = 0; i < receipts.length; i += batchSize) {
      const batch = receipts.slice(i, i + batchSize);
      
      try {
        const batchResults = await this.processBatch(
          batch,
          {
            ...options,
            parallel,
            maxRetries,
            retryDelay,
            onProgress: (current) => {
              processed++;
              progressCallback?.({
                total: receipts.length,
                processed,
                failed: failed.length,
                current
              });
            }
          }
        );

        results.push(...batchResults.filter((r): r is ExportResult => r !== null));

      } catch (error) {
        Logger.error('Batch processing failed', { 
          batchIndex: i, 
          error 
        });
        
        batch.forEach(receipt => {
          failed.push({ 
            receipt, 
            error: error instanceof Error ? error : new Error('Unknown error') 
          });
        });
      }
    }

    // Generate batch report
    const report = await this.generateBatchReport(results, failed);
    
    // Create zip archive
    const zip = await this.createZipArchive(results, report);
    
    return results;
  }

  private async processBatch(
    batch: Array<{
      url: string;
      ocrData: OCRData;
      expenseId: string;
      lineNumber: number;
      category?: string;
      reportReference?: {
        reportId: string;
        reportName: string;
        lineItem: number;
      };
    }>,
    options: BatchExportOptions & {
      onProgress: (current: string) => void;
    }
  ): Promise<Array<ExportResult | null>> {
    const processReceipt = async (receipt: typeof batch[0], attempt = 1): Promise<ExportResult | null> => {
      try {
        const startTime = Date.now();
        
        options.onProgress(receipt.ocrData.merchant);
        
        const processedUrl = await this.processAndExportReceipt(
          receipt.url,
          receipt.ocrData,
          options
        );

        const metadata = await this.generateMetadata(receipt.ocrData, {
          expenseId: receipt.expenseId,
          lineNumber: receipt.lineNumber,
          category: receipt.category,
          reportReference: receipt.reportReference
        });

        const filename = this.generateFilename(metadata, options.format || 'jpg');

        const stats = {
          processingTime: Date.now() - startTime,
          originalSize: 0, // Set from processAndExportReceipt
          processedSize: 0, // Set from processAndExportReceipt
          compressionRatio: 0 // Calculated
        };

        return { url: processedUrl, metadata, filename, stats };

      } catch (error) {
        if (attempt < options.maxRetries!) {
          await new Promise(resolve => setTimeout(resolve, options.retryDelay!));
          return processReceipt(receipt, attempt + 1);
        }
        Logger.error('Receipt processing failed', { receipt, error });
        return null;
      }
    };

    if (options.parallel) {
      return Promise.all(batch.map(receipt => processReceipt(receipt)));
    } else {
      const results: Array<ExportResult | null> = [];
      for (const receipt of batch) {
        results.push(await processReceipt(receipt));
      }
      return results;
    }
  }

  private generateFilename(metadata: ReceiptExportMetadata, format: string): string {
    const safeMerchant = metadata.merchant
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_');

    const dateStr = new Date(metadata.date)
      .toISOString()
      .split('T')[0]
      .replace(/-/g, '');

    const amountStr = Math.round(metadata.amount * 100)
      .toString()
      .padStart(6, '0');

    return `${dateStr}_${safeMerchant}_${amountStr}_${metadata.expenseId}.${format}`;
  }

  private async generateBatchReport(
    results: ExportResult[],
    failed: Array<{ receipt: any; error: Error }>
  ): Promise<any> {
    return {
      timestamp: new Date().toISOString(),
      summary: {
        total: results.length + failed.length,
        successful: results.length,
        failed: failed.length,
        totalSize: results.reduce((sum, r) => sum + (r.stats?.processedSize || 0), 0),
        averageCompressionRatio: results.reduce((sum, r) => sum + (r.stats?.compressionRatio || 0), 0) / results.length
      },
      results: results.map(r => ({
        filename: r.filename,
        merchant: r.metadata.merchant,
        amount: r.metadata.amount,
        stats: r.stats
      })),
      failures: failed.map(f => ({
        merchant: f.receipt.ocrData.merchant,
        error: f.error.message
      }))
    };
  }

  private async createZipArchive(
    results: ExportResult[],
    report: any
  ): Promise<Blob> {
    const zip = new JSZip();
    
    // Add receipts
    results.forEach(result => {
      const folder = zip.folder('receipts')!;
      folder.file(result.filename, result.url.split(',')[1], { base64: true });
    });

    // Add report
    zip.file('report.json', JSON.stringify(report, null, 2));

    return zip.generateAsync({ type: 'blob' });
  }
}

export const receiptExportService = new ReceiptExportService(); 