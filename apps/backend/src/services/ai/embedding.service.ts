import type { ConfigService } from "@/core/config.service";
import { Injectable } from "@nestjs/common";
import type { ErrorHandlerService } from "../error-handler.service";
import type { LoggingService } from "../logging.service";
import type { RateLimiterService } from "../rate-limiter.service";
import { BaseAIService } from "./base-ai.service";

@Injectable()
export class EmbeddingService extends BaseAIService {
  constructor(
    configService: ConfigService,
    rateLimiter: RateLimiterService,
    errorHandler: ErrorHandlerService,
    logger: LoggingService,
  ) {
    super(configService, rateLimiter, errorHandler, logger, EmbeddingService.name);
    this.initializeClient("https://api-inference.huggingface.co/models", {
      Authorization: `Bearer ${configService.getAIConfig().huggingface.apiKey}`,
    });
  }

  async calculateSimilarity(text1: string, text2: string): Promise<number> {
    return this.withRateLimit("AI.HUGGINGFACE.INFERENCE", async () => {
      const response = await this.client.post("/sentence-transformers/all-MiniLM-L6-v2", {
        inputs: [text1, text2],
      });

      const embedding1 = response.data[0];
      const embedding2 = response.data[1];

      const dotProduct = embedding1.reduce(
        (sum: number, val: number, i: number) => sum + val * embedding2[i],
        0,
      );
      const norm1 = Math.sqrt(embedding1.reduce((sum: number, val: number) => sum + val * val, 0));
      const norm2 = Math.sqrt(embedding2.reduce((sum: number, val: number) => sum + val * val, 0));

      return dotProduct / (norm1 * norm2);
    });
  }

  async getEmbedding(text: string): Promise<number[]> {
    return this.withRateLimit("AI.HUGGINGFACE.INFERENCE", async () => {
      const response = await this.client.post("/sentence-transformers/all-MiniLM-L6-v2", {
        inputs: text,
      });

      return response.data[0];
    });
  }
}
