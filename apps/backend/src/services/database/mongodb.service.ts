import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { type Collection, type Db, type Document, MongoClient } from "mongodb";

@Injectable()
export class MongoDBService implements OnModuleDestroy {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private readonly connectTimeout = 30000; // Increased to 30 seconds
  private readonly maxRetries = 3;
  private readonly retryDelay = 2000; // 2 seconds between retries

  constructor(private readonly configService: ConfigService) {}

  async onModuleDestroy() {
    await this.close();
  }

  private async connect(): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const uri = this.configService.get<string>("MONGODB_URI");
        if (!uri) {
          throw new Error("MongoDB URI not configured");
        }

        console.log(`Attempting to connect to MongoDB (attempt ${attempt}/${this.maxRetries})...`);
        console.log("Using URI:", uri.replace(/\/\/[^@]+@/, "//<credentials>@")); // Hide credentials in logs

        this.client = new MongoClient(uri, {
          connectTimeoutMS: this.connectTimeout,
          socketTimeoutMS: this.connectTimeout,
          serverSelectionTimeoutMS: this.connectTimeout,
          maxPoolSize: 10,
          minPoolSize: 1,
          retryWrites: true,
          retryReads: true,
        });

        await this.client.connect();
        this.db = this.client.db();
        await this.db.command({ ping: 1 }); // Verify we can actually perform operations
        console.log("✅ MongoDB connected successfully");
        return;
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ MongoDB connection attempt ${attempt} failed:`, error);

        if (attempt < this.maxRetries) {
          console.log(`Retrying in ${this.retryDelay / 1000} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        }
      }
    }

    // If we get here, all retries failed
    this.client = null;
    this.db = null;
    throw new Error(
      `Failed to connect to MongoDB after ${this.maxRetries} attempts. Last error: ${lastError?.message}`,
    );
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
      console.error("❌ MongoDB ping failed:", error);
      return false;
    }
  }

  async close(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
        this.client = null;
        this.db = null;
        console.log("✅ MongoDB connection closed");
      } catch (error) {
        console.error("❌ Error closing MongoDB connection:", error);
      }
    }
  }
}
