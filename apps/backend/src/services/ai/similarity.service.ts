import { Injectable } from "@nestjs/common";

import { BaseAIService } from "./base-ai.service";
import type { ErrorHandlerService } from "../error-handler.service";
import type { LoggingService } from "../logging.service";
import type { RateLimiterService } from "../rate-limiter.service";

import type { ConfigService } from "@/core/config.service";

export interface SimilarityResult {
  score: number;
  text: string;
}

@Injectable()
export class SimilarityService extends BaseAIService {
  constructor(
    configService: ConfigService,
    rateLimiter: RateLimiterService,
    errorHandler: ErrorHandlerService,
    logger: LoggingService,
  ) {
    super(configService, rateLimiter, errorHandler, logger, SimilarityService.name);
    this.initializeClient("https://api-inference.huggingface.co/models", {
      Authorization: `Bearer ${configService.getAIConfig().huggingface.apiKey}`,
    });
  }

  async findSimilarExpenses(
    description: string,
    candidates: string[],
  ): Promise<SimilarityResult[]> {
    return this.withRateLimit("AI.HUGGINGFACE.INFERENCE", async () => {
      const response = await this.client.post("/sentence-transformers/all-MiniLM-L6-v2", {
        inputs: {
          source_sentence: description,
          sentences: candidates,
        },
      });

      return response.data.map((score: number, index: number) => ({
        score,
        text: candidates[index],
      }));
    });
  }

  async calculateSimilarity(text1: string, text2: string): Promise<number> {
    return this.withRateLimit("AI.HUGGINGFACE.INFERENCE", async () => {
      const response = await this.client.post("/sentence-transformers/all-MiniLM-L6-v2", {
        inputs: {
          source_sentence: text1,
          sentences: [text2],
        },
      });

      return response.data[0];
    });
  }
}
