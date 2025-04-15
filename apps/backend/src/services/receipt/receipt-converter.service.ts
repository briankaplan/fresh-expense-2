import { Injectable, Logger } from '@nestjs/common';
import { convertPdfToImages, optimizeImage, generateThumbnail } from '@packages/utils';

@Injectable()
export class ReceiptConverterService {
  private readonly logger = new Logger(ReceiptConverterService.name);

  /**
   * Convert PDF to image
   */
  async convertPDFToImage(pdfBuffer: Buffer): Promise<Buffer[]> {
    try {
      return await convertPdfToImages(pdfBuffer);
    } catch (error) {
      this.logger.error('Error in PDF conversion:', error);
      throw error;
    }
  }

  /**
   * Optimize image for OCR
   */
  async optimizeForOCR(imageBuffer: Buffer): Promise<Buffer> {
    try {
      return await optimizeImage(imageBuffer);
    } catch (error) {
      this.logger.error('Error in image optimization:', error);
      throw error;
    }
  }

  /**
   * Create thumbnail
   */
  async createThumbnail(imageBuffer: Buffer, width = 300): Promise<Buffer> {
    try {
      return await generateThumbnail(imageBuffer, { width, height: width });
    } catch (error) {
      this.logger.error('Error in thumbnail creation:', error);
      throw error;
    }
  }
}
