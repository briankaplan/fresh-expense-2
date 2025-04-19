import { Injectable, Logger } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import axios, { type AxiosInstance } from "axios";
import type { RateLimiterService } from "../rate-limiter.service";

@Injectable()
export class ClassificationService {
  private readonly logger = new Logger(ClassificationService.name);
  private huggingFaceClient!: AxiosInstance;

  constructor(
    private readonly configService: ConfigService,
    private readonly rateLimiter: RateLimiterService,
  ) {
    this.initializeClient();
  }

  private initializeClient() {
    const huggingFaceApiKey = this.configService.get<string>("HUGGINGFACE_API_KEY");

    this.huggingFaceClient = axios.create({
      baseURL: "https://api-inference.huggingface.co/models",
      headers: {
        Authorization: `Bearer ${huggingFaceApiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });
  }

  async classifyReceipt(text: string) {
    return this.rateLimiter.withRateLimit("AI.HUGGINGFACE.DAILY", async () => {
      try {
        const response = await this.huggingFaceClient.post("/microsoft/deberta-v3-base", {
          inputs: text,
          parameters: {
            candidate_labels: ["receipt", "invoice", "order confirmation", "not a receipt"],
            multi_label: false,
          },
        });

        return {
          isReceipt: response.data.labels[0] !== "not a receipt",
          confidence: response.data.scores[0],
          label: response.data.labels[0],
        };
      } catch (error) {
        this.logger.error("Error classifying receipt:", error);
        throw error;
      }
    });
  }
}
