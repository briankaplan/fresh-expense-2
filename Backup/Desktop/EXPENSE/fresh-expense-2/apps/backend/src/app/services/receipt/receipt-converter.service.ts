import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';

interface ConversionOptions {
  width?: number;
  height?: number;
  quality?: number;
}

@Injectable()
export class ReceiptConverterService {
  private readonly logger = new Logger(ReceiptConverterService.name);

  /**
   * Convert HTML content to PDF
   */
  async htmlToPdf(html: string, options: ConversionOptions = {}): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: 'new' });
    try {
      const page = await browser.newPage();
      await page.setContent(html);
      
      const pdf = await page.pdf({
        width: options.width ? `${options.width}px` : undefined,
        height: options.height ? `${options.height}px` : undefined,
        printBackground: true,
        format: options.width ? undefined : 'A4'
      });

      return pdf;
    } finally {
      await browser.close();
    }
  }

  /**
   * Convert PDF to image
   */
  async pdfToImage(pdfBuffer: Buffer, options: ConversionOptions = {}): Promise<{ buffer: Buffer; pages: number }> {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPageCount();

    // For now, we only convert the first page
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();

    // Create a new document with just the first page
    const singlePageDoc = await PDFDocument.create();
    const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [0]);
    singlePageDoc.addPage(copiedPage);

    const singlePageBuffer = await singlePageDoc.save();

    // Convert to image using sharp
    const image = await sharp(singlePageBuffer)
      .resize(options.width || width, options.height || height, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png({ quality: options.quality || 100 })
      .toBuffer();

    return { buffer: image, pages };
  }

  /**
   * Generate image preview
   */
  async generatePreview(buffer: Buffer, mimeType: string, options: ConversionOptions = {}): Promise<Buffer> {
    if (mimeType === 'application/pdf') {
      const { buffer: imageBuffer } = await this.pdfToImage(buffer, options);
      return imageBuffer;
    }

    // For images, just resize
    return sharp(buffer)
      .resize(options.width || 800, options.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: options.quality || 80 })
      .toBuffer();
  }
} 