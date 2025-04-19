import { Injectable, Logger } from "@nestjs/common";
import * as pdf2img from "pdf-img-convert";
import sharp from "sharp";

export interface ProcessedReceipt {
  imageBuffer: Buffer;
  thumbnailBuffer: Buffer;
  metadata: {
    mimeType: string;
    originalSize: number;
    processedSize: number;
    ocrData?: {
      text: string;
      confidence: number;
      items?: Array<{
        description: string;
        amount: number;
        quantity?: number;
      }>;
    };
  };
}

@Injectable()
export class ReceiptProcessorService {
  private readonly logger = new Logger(ReceiptProcessorService.name);

  async process(
    file: Buffer,
    mimeType: string,
    options: { performOcr?: boolean } = {},
  ): Promise<ProcessedReceipt> {
    try {
      let imageBuffer = file;

      // Convert PDF to image if needed
      if (mimeType === "application/pdf") {
        imageBuffer = await this.convertPDFToImage(file);
      }

      // Optimize image
      const optimizedImage = await this.optimizeImage(imageBuffer);

      // Generate thumbnail
      const thumbnail = await this.createThumbnail(optimizedImage);

      // Perform OCR if requested
      let ocrData;
      if (options.performOcr) {
        ocrData = await this.performOCR(optimizedImage);
      }

      return {
        imageBuffer: optimizedImage,
        thumbnailBuffer: thumbnail,
        metadata: {
          mimeType: "image/jpeg",
          originalSize: file.length,
          processedSize: optimizedImage.length,
          ...(ocrData && { ocrData }),
        },
      };
    } catch (error) {
      this.logger.error("Error processing receipt:", error);
      throw error;
    }
  }

  private async convertPDFToImage(pdfBuffer: Buffer): Promise<Buffer> {
    try {
      const pngPages = await pdf2img.convert(pdfBuffer, {
        width: 1200,
        height: 1800,
        page_numbers: [1],
        base64: false,
      });

      return await sharp(pngPages[0]).jpeg({ quality: 85 }).toBuffer();
    } catch (error) {
      this.logger.error("Error converting PDF to image:", error);
      throw error;
    }
  }

  private async optimizeImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .greyscale()
        .normalize()
        .sharpen()
        .jpeg({ quality: 85 })
        .toBuffer();
    } catch (error) {
      this.logger.error("Error optimizing image:", error);
      throw error;
    }
  }

  private async createThumbnail(imageBuffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .resize(300, null, {
          fit: "contain",
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 80,
          progressive: true,
        })
        .toBuffer();
    } catch (error) {
      this.logger.error("Error creating thumbnail:", error);
      throw error;
    }
  }

  private async performOCR(imageBuffer: Buffer): Promise<any> {
    // TODO: Implement OCR integration
    // This would integrate with your preferred OCR service
    return null;
  }
}
