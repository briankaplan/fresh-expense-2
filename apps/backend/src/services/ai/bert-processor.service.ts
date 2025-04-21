import { Injectable, Logger } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { EventEmitter2 } from "@nestjs/event-emitter";
import axios from "axios";

import type { NotificationService } from "../notification/notification.service";

interface CategorizationResult {
  category: string;
  confidence: number;
  subcategory?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class BertProcessorService {
  private readonly logger = new Logger(BertProcessorService.name);
  private initialized = false;
  private serverUrl: string;
  private readonly categories = [
    "retail",
    "restaurant",
    "grocery",
    "gas",
    "pharmacy",
    "medical",
    "utility",
    "hotel",
    "transportation",
    "digital",
    "subscription",
    "app_store",
    "play_store",
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationService: NotificationService,
  ) {
    this.serverUrl = this.configService.get<string>("BERT_SERVER_URL") || "http://localhost:5555";
  }

  async initialize(): Promise<boolean> {
    try {
      if (this.initialized) {
        return true;
      }

      // Check if BERT server is running
      const response = await axios.get(`${this.serverUrl}/status`);
      if (response.status !== 200) {
        throw new Error("BERT server is not responding");
      }

      this.initialized = true;
      this.logger.log("BERT processor initialized successfully");
      return true;
    } catch (error) {
      this.logger.error("Failed to initialize BERT processor:", error);
      await this.notificationService.notifyError(
        error instanceof Error ? error : new Error(String(error)),
        "BERT Processor Initialization",
      );
      return false;
    }
  }

  async categorize(text: string, categories?: string[]): Promise<CategorizationResult> {
    if (!this.initialized) {
      const success = await this.initialize();
      if (!success) {
        throw new Error("Failed to initialize BERT processor");
      }
    }

    try {
      const targetCategories = categories || this.categories;

      const response = await axios.post(`${this.serverUrl}/categorize`, {
        text,
        categories: targetCategories,
      });

      if (response.status !== 200) {
        throw new Error("Failed to categorize text");
      }

      return {
        category: response.data.category,
        confidence: response.data.confidence,
        subcategory: response.data.subcategory,
        metadata: response.data.metadata,
      };
    } catch (error) {
      this.logger.error("Error categorizing text:", error);
      await this.notificationService.notifyError(
        error instanceof Error ? error : new Error(String(error)),
        "Text Categorization",
      );
      throw error;
    }
  }

  async close(): Promise<boolean> {
    try {
      this.initialized = false;
      this.logger.log("BERT processor closed successfully");
      return true;
    } catch (error) {
      this.logger.error("Error closing BERT processor:", error);
      return false;
    }
  }
}
