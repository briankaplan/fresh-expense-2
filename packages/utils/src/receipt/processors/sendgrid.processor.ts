import * as os from "os";
import * as path from "path";
import * as fs from "fs/promises";
import axios from "axios";
import * as cheerio from "cheerio";
import * as pdfParse from "pdf-parse";
import * as puppeteer from "puppeteer";
import { Injectable, Logger } from "@nestjs/common";
import { BaseReceiptProcessor, ProcessingOptions, ProcessingResult } from "./base.processor";
import type { SendgridDocument } from "@fresh-expense/types";
import { createWorker } from "tesseract.js";

interface Attachment {
  filename: string;
  content: Buffer;
  contentType: string;
  size: number;
}

interface ProcessedReceipt {
  filename: string;
  content: Buffer;
  type: string;
  metadata: Record<string, unknown>;
}

interface ReceiptData {
  amount?: number;
  date?: Date;
  merchant?: string;
  tax?: number;
  items?: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
}

@Injectable()
export class SendGridProcessor extends BaseReceiptProcessor {
  private readonly logger = new Logger(SendGridProcessor.name);
  private readonly tempDir: string;
  private browser: puppeteer.Browser | null = null;
  private worker: any = null;

  public constructor() {
    super();
    this.tempDir = path.join(os.tmpdir(), 'receipts');
  }

  public async onModuleInit(): Promise<void> {
    await fs.mkdir(this.tempDir, { recursive: true });

    // Initialize browser for HTML to PDF conversion
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Initialize Tesseract worker for OCR
    this.worker = await createWorker('eng');
  }

  public async onModuleDestroy(): Promise<void> {
    try {
      await fs.rm(this.tempDir, { recursive: true, force: true });
    } catch (error: unknown) {
      this.logger.error(
        `Error cleaning up temp directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined
      );
    }

    if (this.browser) {
      await this.browser.close();
    }
    if (this.worker) {
      await this.worker.terminate();
    }
  }

  public async processSendGrid(
    doc: SendgridDocument,
    options: ProcessingOptions = {},
  ): Promise<ProcessingResult> {
    try {
      if (!this.validateDocument(doc)) {
        return { success: false, error: "Invalid document" };
      }

      const result = await this.processReceipt(doc, options);
      return result;
    } catch (error: unknown) {
      this.logger.error(
        `Error processing SendGrid document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  public async processReceipt(
    doc: SendgridDocument,
    options: ProcessingOptions = {},
  ): Promise<ProcessingResult> {
    try {
      // Process HTML content if present
      if (doc.metadata.html) {
        const htmlResult = await this.processHtmlContent(doc.metadata.html, options);
        if (!htmlResult.success) {
          return htmlResult;
        }
      }

      // Process links if present
      if (doc.metadata.links?.length) {
        const linksResult = await this.processLinks(doc.metadata.links, options);
        if (!linksResult.success) {
          return linksResult;
        }
      }

      // Process attachments if present
      if (doc.metadata.attachments?.length) {
        const attachmentResult = await this.processAttachments(
          doc.metadata.attachments,
          options,
        );
        if (!attachmentResult.success) {
          return attachmentResult;
        }
      }

      // Enrich data if requested
      if (options.enrich) {
        const enrichResult = await this.enrichData(doc, options);
        if (!enrichResult.success) {
          return enrichResult;
        }
      }

      // Store document if requested
      if (options.store) {
        const storeResult = await this.storeDocument(doc, options);
        if (!storeResult.success) {
          return storeResult;
        }
      }

      return { success: true };
    } catch (error: unknown) {
      this.logger.error(
        `Error processing receipt: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  protected async processHtmlContent(
    html: string,
    _options: ProcessingOptions = {},
  ): Promise<ProcessingResult> {
    try {
      this.logger.log("Processing HTML content");

      // Extract receipt information from HTML
      const receiptData = await this.extractReceiptFromHtml(html);

      // Convert HTML to PDF if needed
      if (receiptData.needsConversion) {
        const pdfBuffer = await this.convertHtmlToPdf(html);
        await this.processPdfBuffer(pdfBuffer, "receipt.pdf");
      }

      return { success: true };
    } catch (error: unknown) {
      this.logger.error(
        `Error processing HTML content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "HTML processing failed",
      };
    }
  }

  protected async processLinks(
    links: string[],
    _options: ProcessingOptions = {},
  ): Promise<ProcessingResult> {
    try {
      this.logger.log("Processing links");

      for (const link of links) {
        try {
          const response = await axios.get(link, { responseType: 'arraybuffer' });
          const contentType = response.headers['content-type'];
          const filename = path.basename(link);

          const processedReceipt = await this.processDownloadedContent(
            response.data,
            filename,
            contentType,
            {}
          );

          if (!processedReceipt.success) {
            return processedReceipt;
          }
        } catch (error: unknown) {
          this.logger.warn(
            `Failed to process link ${link}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      return { success: true };
    } catch (error: unknown) {
      this.logger.error(
        `Error processing links: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Link processing failed",
      };
    }
  }

  protected async processAttachments(
    attachments: SendgridDocument["metadata"]["attachments"],
    _options: ProcessingOptions = {},
  ): Promise<ProcessingResult> {
    try {
      for (const attachment of attachments || []) {
        const { filename, content, contentType } = attachment;

        // Process based on content type
        switch (contentType) {
          case "application/pdf":
            await this.processPdfAttachment(attachment);
            break;
          case "image/jpeg":
          case "image/png":
            await this.processImageAttachment(attachment);
            break;
          case "text/html":
            await this.processHtmlAttachment(attachment);
            break;
          default:
            this.logger.warn(`Unsupported attachment type: ${contentType}`);
        }
      }

      return { success: true };
    } catch (error: unknown) {
      this.logger.error(
        `Error processing attachments: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Attachment processing failed",
      };
    }
  }

  private async processPdfAttachment(attachment: Attachment): Promise<void> {
    this.logger.log(`Processing PDF attachment: ${attachment.filename}`);

    // Save PDF to temp directory
    const tempPath = path.join(this.tempDir, attachment.filename);
    await fs.writeFile(tempPath, attachment.content);

    // Extract text from PDF
    const text = await this.extractTextFromPdf(tempPath);

    // Process through ReceiptBank
    await this.processReceiptBank({
      filename: attachment.filename,
      content: attachment.content,
      type: 'pdf',
      metadata: { extractedText: text }
    });

    // Clean up
    await fs.unlink(tempPath);
  }

  private async processImageAttachment(attachment: Attachment): Promise<void> {
    this.logger.log(`Processing image attachment: ${attachment.filename}`);

    // Save image to temp directory
    const tempPath = path.join(this.tempDir, attachment.filename);
    await fs.writeFile(tempPath, attachment.content);

    // Perform OCR processing
    const ocrResult = await this.performOcr(tempPath);

    // Process through ReceiptBank
    await this.processReceiptBank({
      filename: attachment.filename,
      content: attachment.content,
      type: 'image',
      metadata: { ocrResult }
    });

    // Clean up
    await fs.unlink(tempPath);
  }

  private async processHtmlAttachment(attachment: Attachment): Promise<void> {
    this.logger.log(`Processing HTML attachment: ${attachment.filename}`);

    // Convert HTML to PDF
    const pdfBuffer = await this.convertHtmlToPdf(attachment.content.toString());

    // Process as PDF
    await this.processPdfBuffer(pdfBuffer, attachment.filename.replace('.html', '.pdf'));
  }

  private async extractReceiptFromHtml(html: string): Promise<{ needsConversion: boolean; data?: Record<string, unknown> }> {
    try {
      // Parse HTML content
      const receiptData: Record<string, unknown> = {};

      // Extract common receipt fields using regex
      const amountMatch = html.match(/(?:total|amount|sum)\s*:?\s*\$?\s*(\d+\.?\d*)/i);
      if (amountMatch) {
        receiptData.amount = parseFloat(amountMatch[1]);
      }

      const dateMatch = html.match(/(?:date|purchase date)\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i);
      if (dateMatch) {
        receiptData.date = new Date(dateMatch[1]);
      }

      const merchantMatch = html.match(/(?:merchant|store|vendor)\s*:?\s*([^\n<]+)/i);
      if (merchantMatch) {
        receiptData.merchant = merchantMatch[1].trim();
      }

      // Check if we need to convert to PDF
      const needsConversion = !receiptData.amount || !receiptData.date || !receiptData.merchant;

      return {
        needsConversion,
        data: receiptData
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error extracting receipt from HTML: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined
      );
      return { needsConversion: true };
    }
  }

  private async convertHtmlToPdf(html: string): Promise<Buffer> {
    try {
      if (!this.browser) {
        throw new Error('Browser not initialized');
      }

      const page = await this.browser.newPage();
      await page.setContent(html);
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });
      await page.close();
      // TODO: Implement using a proper HTML to PDF conversion library
      // For now, we'll use a simple placeholder
      const pdfContent = `
        %PDF-1.4
        1 0 obj
        << /Type /Catalog /Pages 2 0 R >>
        endobj
        2 0 obj
        << /Type /Pages /Kids [3 0 R] /Count 1 >>
        endobj
        3 0 obj
        << /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
        endobj
        4 0 obj
        << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
        endobj
        5 0 obj
        << /Length 44 >>
        stream
        BT
        /F1 12 Tf
        50 700 Td
        (Receipt) Tj
        ET
        endstream
        endobj
        xref
        0 6
        0000000000 65535 f
        0000000009 00000 n
        0000000053 00000 n
        0000000122 00000 n
        0000000212 00000 n
        0000000301 00000 n
        trailer
        << /Size 6 /Root 1 0 R >>
        startxref
        364
        %%EOF
      `;
      return Buffer.from(pdfContent);
    } catch (error: unknown) {
      this.logger.error(
        `Error converting HTML to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined
      );
      throw error;
    }
  }

  private async extractTextFromPdf(pdfPath: string): Promise<string> {
    try {
      // TODO: Implement using a proper PDF text extraction library
      // For now, we'll use a simple placeholder
      const text = `
        Receipt
        Date: ${new Date().toLocaleDateString()}
        Amount: $0.00
        Merchant: Unknown
      `;
      return text;
    } catch (error: unknown) {
      this.logger.error(
        `Error extracting text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined
      );
      throw error;
    }
  }

  private async performOcr(imagePath: string): Promise<Record<string, unknown>> {
    try {
      // TODO: Implement using a proper OCR library
      // For now, we'll use a simple placeholder
      const ocrResult = {
        text: "Receipt\nDate: Unknown\nAmount: $0.00\nMerchant: Unknown",
        confidence: 0.0,
        metadata: {
          width: 0,
          height: 0,
          format: path.extname(imagePath).slice(1)
        }
      };
      return ocrResult;
    } catch (error: unknown) {
      this.logger.error(
        `Error performing OCR: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined
      );
      throw error;
    }
  }

  private async processReceiptBank(receipt: ProcessedReceipt): Promise<void> {
    try {
      // TODO: Implement proper ReceiptBank API integration
      this.logger.log(`Processing receipt through ReceiptBank: ${receipt.filename}`);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.logger.log(`Successfully processed receipt: ${receipt.filename}`);
    } catch (error: unknown) {
      this.logger.error(
        `Error processing receipt through ReceiptBank: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined
      );
      throw error;
    }
  }

  private async processPdfBuffer(buffer: Buffer, filename: string): Promise<void> {
    const tempPath = path.join(this.tempDir, filename);
    await fs.writeFile(tempPath, buffer);
    await this.processPdfAttachment({
      filename,
      content: buffer,
      contentType: 'application/pdf',
      size: buffer.length
    });
  }

  private async processDownloadedContent(
    content: Buffer,
    filename: string,
    contentType: string,
    _options: ProcessingOptions
  ): Promise<ProcessingResult> {
    try {
      const attachment: Attachment = {
        filename,
        content,
        contentType,
        size: content.length
      };

      switch (contentType) {
        case "application/pdf":
          await this.processPdfAttachment(attachment);
          break;
        case "image/jpeg":
        case "image/png":
          await this.processImageAttachment(attachment);
          break;
        case "text/html":
          await this.processHtmlAttachment(attachment);
          break;
        default:
          this.logger.warn(`Unsupported content type: ${contentType}`);
      }

      return { success: true };
    } catch (error: unknown) {
      this.logger.error(
        `Error processing downloaded content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Content processing failed",
      };
    }
  }
}
