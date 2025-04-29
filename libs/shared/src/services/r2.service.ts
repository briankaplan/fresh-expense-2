import { Injectable } from '@nestjs/common';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { BaseR2Service } from './base-r2.service';

@Injectable()
export class R2Service extends BaseR2Service {
    constructor() {
        super({
            accountId: process.env.R2_ACCOUNT_ID!,
            accessKeyId: process.env.R2_ACCESS_KEY_ID!,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
            bucket: process.env.R2_BUCKET_NAME!,
            endpoint: `https://${process.env.R2_ACCOUNT_ID!}.r2.cloudflarestorage.com`,
        });
    }

    async upload(file: Buffer, key?: string): Promise<string> {
        try {
            const fileKey = key || this.generateKey(key || 'file');

            await this.s3.send(
                new PutObjectCommand({
                    Bucket: this.bucket,
                    Key: fileKey,
                    Body: file,
                    ContentType: 'application/octet-stream',
                })
            );

            return `https://${this.bucket}.r2.cloudflarestorage.com/${fileKey}`;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw new Error('Failed to upload file to R2');
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await this.s3.send(
                new DeleteObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                })
            );
        } catch (error) {
            console.error('Error deleting file:', error);
            throw new Error('Failed to delete file from R2');
        }
    }
} 