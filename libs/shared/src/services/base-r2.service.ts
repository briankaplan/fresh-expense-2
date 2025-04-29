import { S3, S3ClientConfig } from '@aws-sdk/client-s3';

export abstract class BaseR2Service {
    protected s3: S3;
    protected bucket: string;

    constructor(config: { accountId: string; accessKeyId: string; secretAccessKey: string; bucket: string; endpoint: string }) {
        this.bucket = config.bucket;

        const s3Config: S3ClientConfig = {
            endpoint: config.endpoint,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
            region: 'auto'
        };

        this.s3 = new S3(s3Config);
    }

    abstract upload(file: Buffer, key?: string): Promise<string>;
    abstract delete(key: string): Promise<void>;

    protected generateKey(originalName: string): string {
        return `${Date.now()}-${originalName}`;
    }
} 