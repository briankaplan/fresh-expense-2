import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../app/auth/guards/auth.guard";
import type { ClassificationService } from "../services/ai/classification.service";
import type { ExtractionService } from "../services/ai/extraction.service";
import type { ExtractedReceiptInfo } from "../services/ai/extraction.service";
import type { SimilarityService } from "../services/ai/similarity.service";
import type { SimilarityResult } from "../services/ai/similarity.service";

export class AIController {
  constructor(
    private readonly classificationService: ClassificationService,
    private readonly extractionService: ExtractionService,
    private readonly similarityService: SimilarityService,
  ) {}

  async classifyReceipt(@Body() body: { text: string }) {
    return this.classificationService.classifyReceipt(body.text);
  }

  async extractReceiptInfo(@Body() body: { text: string }): Promise<ExtractedReceiptInfo> {
    return this.extractionService.extractReceiptInfo(body.text);
  }

  async findSimilarExpenses(
    @Body() body: { description: string; candidates: string[] },
  ): Promise<SimilarityResult[]> {
    return this.similarityService.findSimilarExpenses(body.description, body.candidates);
  }

  async calculateSimilarity(@Body() body: { text1: string; text2: string }): Promise<number> {
    return this.similarityService.calculateSimilarity(body.text1, body.text2);
  }
}
