import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { MongoClient, Db, Collection, Document } from 'mongodb';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MongoDBService implements OnModuleDestroy {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private readonly connectTimeout = 5000;

  constructor(private readonly configService: ConfigService) {}

  async onModuleDestroy() {
    await this.close();
  }

  private async connect(): Promise<void> {
    try {
      const uri = this.configService.get<string>('MONGODB_URI');
      if (!uri) {
        throw new Error('MongoDB URI not configured');
      }

      console.log('Attempting to connect to MongoDB...');
      console.log('Using URI:', uri.replace(/\/\/[^@]+@/, '//<credentials>@')); // Hide credentials in logs

      this.client = new MongoClient(uri, {
        connectTimeoutMS: this.connectTimeout,
        socketTimeoutMS: this.connectTimeout,
        serverSelectionTimeoutMS: this.connectTimeout,
      });

      await this.client.connect();
      this.db = this.client.db();
      await this.db.command({ ping: 1 }); // Verify we can actually perform operations
      console.log('✅ MongoDB connected successfully');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      this.client = null;
      this.db = null;
      throw error;
    }
  }

  async getDb(): Promise<Db> {
    if (!this.client || !this.db) {
      await this.connect();
    }
    return this.db!;
  }

  async getCollection<T extends Document>(name: string): Promise<Collection<T>> {
    const db = await this.getDb();
    return db.collection<T>(name);
  }

  async isConnected(): Promise<boolean> {
    try {
      if (!this.client || !this.db) {
        return false;
      }
      await this.db.command({ ping: 1 });
      return true;
    } catch (error) {
      console.error('❌ MongoDB ping failed:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
        this.client = null;
        this.db = null;
        console.log('✅ MongoDB connection closed');
      } catch (error) {
        console.error('❌ Error closing MongoDB connection:', error);
      }
    }
  }
}
