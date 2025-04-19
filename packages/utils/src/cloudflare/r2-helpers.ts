import { Logger } from '@nestjs/common';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const logger = new Logger('R2Helpers');

export async function updateSignedUrls<
  T extends {
    get: (key: string) => any;
    set: (key: string, value: any) => void;
  },
>(
  documents: T[],
  r2Service: { getSignedUrl: (key: string) => Promise<string> },
  options = {
    keyField: 'r2Key',
    thumbnailField: 'r2ThumbnailKey',
    urlField: 'fullImageUrl',
    thumbnailUrlField: 'thumbnailUrl',
  },
): Promise<void> {
  try {
    for (const doc of documents) {
      const r2Key = doc.get(options.keyField);
      const r2ThumbnailKey = doc.get(options.thumbnailField);

      if (r2Key) {
        doc.set(options.urlField, await r2Service.getSignedUrl(r2Key));
      }

      if (r2ThumbnailKey) {
        doc.set(options.thumbnailUrlField, await r2Service.getSignedUrl(r2ThumbnailKey));
      }
    }
  } catch (error) {
    logger.error('Error updating signed URLs:', error);
    throw error;
  }
}

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl?: string;
}

export interface SignedUrlOptions {
  expiresIn?: number; // Seconds
  contentType?: string;
  contentDisposition?: string;
}

/**
 * Create an S3 client for Cloudflare R2
 */
export function createR2Client(config: R2Config): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

/**
 * Generate a signed URL for downloading a file from R2
 */
export async function getSignedDownloadUrl(
  client: S3Client,
  bucket: string,
  key: string,
  options: SignedUrlOptions = {},
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return getSignedUrl(client, command, {
    expiresIn: options.expiresIn || 3600,
  });
}

/**
 * Generate a signed URL for uploading a file to R2
 */
export async function getSignedUploadUrl(
  client: S3Client,
  bucket: string,
  key: string,
  options: SignedUrlOptions = {},
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: options.contentType,
    ContentDisposition: options.contentDisposition,
  });

  return getSignedUrl(client, command, {
    expiresIn: options.expiresIn || 3600,
  });
}

/**
 * Get a public URL for a file in R2 (if configured)
 */
export function getPublicUrl(config: R2Config, key: string): string | null {
  if (!config.publicUrl) return null;
  return `${config.publicUrl.replace(/\/$/, '')}/${key}`;
}

/**
 * Generate a unique key for storing a file in R2
 */
export function generateStorageKey(prefix: string, fileName: string, uniqueId?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const id = uniqueId || random;
  const extension = fileName.split('.').pop();

  return `${prefix}/${timestamp}-${id}.${extension}`;
}
