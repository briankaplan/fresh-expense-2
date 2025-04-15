import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationService } from '../notification/notification.service';
import { spawn } from 'child_process';
import axios from 'axios';

@Injectable()
export class BertServerService {
  private readonly logger = new Logger(BertServerService.name);
  private server: any;
  private port: number;
  private modelPath: string;
  private isRunning = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationService: NotificationService
  ) {
    this.port = this.configService.get<number>('BERT_SERVER_PORT') || 5555;
    this.modelPath =
      this.configService.get<string>('BERT_MODEL_PATH') || './models/bert-base-uncased';
  }

  async start(): Promise<boolean> {
    try {
      if (this.isRunning) {
        return true;
      }

      this.logger.log('🚀 Starting BERT server...');

      // Start the BERT server process
      this.server = spawn('bert-serving-start', [
        '-model_dir',
        this.modelPath,
        '-num_worker',
        '1',
        '-max_seq_len',
        '512',
        '-port',
        this.port.toString(),
        '-max_batch_size',
        '32',
      ]);

      // Handle server output
      this.server.stdout.on('data', (data: Buffer) => {
        this.logger.log(`BERT Server: ${data.toString()}`);
      });

      this.server.stderr.on('data', (data: Buffer) => {
        this.logger.error(`BERT Server Error: ${data.toString()}`);
      });

      // Handle server exit
      this.server.on('close', (code: number) => {
        this.logger.log(`BERT Server exited with code ${code}`);
        this.isRunning = false;
      });

      // Wait for server to be ready
      await this.waitForServer();

      this.isRunning = true;
      this.logger.log('✅ BERT server started successfully');
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to start BERT server:', error);
      await this.notificationService.notifyError(
        error instanceof Error ? error : new Error(String(error)),
        'BERT Server Startup'
      );
      return false;
    }
  }

  async stop(): Promise<boolean> {
    try {
      if (this.server) {
        this.logger.log('🛑 Stopping BERT server...');
        this.server.kill();
        this.server = null;
        this.isRunning = false;
        this.logger.log('✅ BERT server stopped');
      }
      return true;
    } catch (error) {
      this.logger.error('Error stopping BERT server:', error);
      return false;
    }
  }

  private async waitForServer(): Promise<void> {
    const maxAttempts = 30;
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const checkServer = async () => {
        try {
          const response = await axios.get(`http://localhost:${this.port}/status`);
          if (response.status === 200) {
            resolve();
          } else {
            throw new Error('Server not ready');
          }
        } catch (error) {
          attempts++;
          if (attempts >= maxAttempts) {
            reject(new Error('BERT server failed to start'));
          } else {
            setTimeout(checkServer, 1000);
          }
        }
      };

      checkServer();
    });
  }

  isServerRunning(): boolean {
    return this.isRunning;
  }
}
