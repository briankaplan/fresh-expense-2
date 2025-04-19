import sharp from 'sharp';
import * as pdfImgConvert from 'pdf-img-convert';
import { Logger } from '@nestjs/common';

const logger = new Logger('ImageProcessingUtil');

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface ThumbnailOptions {
  width: number;
  height: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/**
 * Convert a PDF buffer to an array of image buffers
 */
export async function convertPdfToImages(
  pdfBuffer: Buffer,
  options: ImageProcessingOptions = {},
): Promise<Buffer[]> {
  try {
    const pages = await pdfImgConvert.convert(pdfBuffer, {
      width: options.width,
      height: options.height,
      base64: false,
    });

    // Convert Uint8Array to Buffer
    return pages.map(page => {
      if (page instanceof Uint8Array) {
        return Buffer.from(page.buffer);
      }
      // If it's a base64 string (shouldn't happen with base64: false)
      return Buffer.from(page, 'base64');
    });
  } catch (error) {
    logger.error('Error converting PDF to images:', error);
    throw new Error('Failed to convert PDF to images');
  }
}

/**
 * Optimize an image buffer with the specified options
 */
export async function optimizeImage(
  imageBuffer: Buffer,
  options: ImageProcessingOptions = {},
): Promise<Buffer> {
  try {
    const image = sharp(imageBuffer);

    if (options.width || options.height) {
      image.resize(options.width, options.height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    switch (options.format) {
      case 'jpeg':
        image.jpeg({ quality: options.quality || 80 });
        break;
      case 'png':
        image.png({ quality: options.quality || 80 });
        break;
      case 'webp':
        image.webp({ quality: options.quality || 80 });
        break;
      default:
        // Keep original format
        break;
    }

    return image.toBuffer();
  } catch (error) {
    logger.error('Error optimizing image:', error);
    throw new Error('Failed to optimize image');
  }
}

/**
 * Generate a thumbnail from an image buffer
 */
export async function generateThumbnail(
  imageBuffer: Buffer,
  options: ThumbnailOptions,
): Promise<Buffer> {
  try {
    return sharp(imageBuffer)
      .resize(options.width, options.height, {
        fit: options.fit || 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch (error) {
    logger.error('Error generating thumbnail:', error);
    throw new Error('Failed to generate thumbnail');
  }
}

/**
 * Extract metadata from an image buffer
 */
export async function extractImageMetadata(imageBuffer: Buffer) {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      hasAlpha: metadata.hasAlpha,
      orientation: metadata.orientation,
    };
  } catch (error) {
    logger.error('Error extracting image metadata:', error);
    throw new Error('Failed to extract image metadata');
  }
}
