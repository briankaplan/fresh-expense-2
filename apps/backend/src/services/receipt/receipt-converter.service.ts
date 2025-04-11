import { Injectable, Logger } from '@nestjs/common';
import * as pdf2img from 'pdf-img-convert';
import sharp from 'sharp';

@Injectable()
export class ReceiptConverterService {
  private readonly logger = new Logger(ReceiptConverterService.name);

  /**
   * Convert PDF to image
   */
  async convertPDFToImage(pdfBuffer: Buffer): Promise<Buffer> {
    try {
      // Convert PDF to images (returns array of images, we take first page)
      const pngPages = await pdf2img.convert(pdfBuffer, {
        width: 1200, // Reasonable width for OCR
        height: 1800, // Maintain aspect ratio
        page_numbers: [1], // Only first page
        base64: false
      });

      // Convert output to buffer using sharp
      const imageBuffer = await sharp(pngPages[0])
        .png()
        .toBuffer();

      return imageBuffer;
    } catch (error) {
      this.logger.error('Error converting PDF to image:', error);
      throw error;
    }
  }

  /**
   * Optimize image for OCR
   */
  async optimizeForOCR(imageBuffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .greyscale() // Convert to greyscale
        .normalize() // Normalize contrast
        .sharpen() // Sharpen edges
        .png() // Convert to PNG
        .toBuffer();
    } catch (error) {
      this.logger.error('Error optimizing image for OCR:', error);
      throw error;
    }
  }

  /**
   * Create thumbnail
   */
  async createThumbnail(imageBuffer: Buffer, width = 300): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .resize(width, null, {
          fit: 'contain',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 80,
          progressive: true
        })
        .toBuffer();
    } catch (error) {
      this.logger.error('Error creating thumbnail:', error);
      throw error;
    }
  }
} 