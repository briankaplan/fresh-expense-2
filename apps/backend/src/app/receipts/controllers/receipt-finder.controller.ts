import { ApiResponse, User } from "@fresh-expense/types";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import type { ReceiptFinderService } from "../../../services/receipt/receipt-finder.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";

export class ReceiptFinderController {
  constructor(private readonly receiptFinderService: ReceiptFinderService) {}

  async search(
    @User("id") userId: string,
    @Query("query") query?: string,
    @Query("merchant") merchant?: string,
    @Query("minAmount") minAmount?: number,
    @Query("maxAmount") maxAmount?: number,
    @Query("startDate") startDate?: Date,
    @Query("endDate") endDate?: Date,
    @Query("categories") categories?: string[],
    @Query("tags") tags?: string[],
    @Query("source") source?: string,
    @Query("fuzzyMatch") fuzzyMatch?: boolean,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: string,
  ) {
    return this.receiptFinderService.findReceipts({
      userId,
      query,
      merchant,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      categories,
      tags,
      source: source as unknown,
      fuzzyMatch,
      limit,
      offset,
      sortBy: sortBy as unknown,
      sortOrder: sortOrder as unknown,
    });
  }

  async findSimilar(@User("id") userId: string, @Param("id") id: string) {
    const receipt = await this.receiptFinderService.findById(id, userId);
    return this.receiptFinderService.findSimilarReceipts(receipt);
  }

  async batchDelete(
    @User("id") userId: string,
    @Body(new ParseArrayPipe({ items: String })) receiptIds: string[],
  ) {
    return this.receiptFinderService.batchDelete(receiptIds, userId);
  }

  async batchCategorize(
    @User("id") userId: string,
    @Body("receiptIds", new ParseArrayPipe({ items: String }))
    receiptIds: string[],
    @Body("category") category: string,
  ) {
    return this.receiptFinderService.batchCategorize(receiptIds, userId, category);
  }
}
