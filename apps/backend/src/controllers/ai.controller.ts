import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../app/auth/guards/auth.guard';
import { ClassificationService } from '../services/ai/classification.service';
import { ExtractionService } from '../services/ai/extraction.service';
import { SimilarityService } from '../services/ai/similarity.service';
import { ExtractedReceiptInfo } from '../services/ai/extraction.service';
import { SimilarityResult } from '../services/ai/similarity.service';

@Controller('ai')
@UseGuards(AuthGuard)
export class AIController {
  constructor(
    private readonly classificationService: ClassificationService,
    private readonly extractionService: ExtractionService,
    private readonly similarityService: SimilarityService
  ) {}

  @Post('classify-receipt')
  async classifyReceipt(@Body() body: { text: string }) {
    return this.classificationService.classifyReceipt(body.text);
  }

  @Post('extract-info')
  async extractReceiptInfo(@Body() body: { text: string }): Promise<ExtractedReceiptInfo> {
    return this.extractionService.extractReceiptInfo(body.text);
  }

  @Post('find-similar')
  async findSimilarExpenses(
    @Body() body: { description: string; candidates: string[] }
  ): Promise<SimilarityResult[]> {
    return this.similarityService.findSimilarExpenses(body.description, body.candidates);
  }

  @Post('calculate-similarity')
  async calculateSimilarity(
    @Body() body: { text1: string; text2: string }
  ): Promise<number> {
    return this.similarityService.calculateSimilarity(body.text1, body.text2);
  }
} 