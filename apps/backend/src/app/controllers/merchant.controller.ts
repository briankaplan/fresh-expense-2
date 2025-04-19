import type { MerchantSource } from "@fresh-expense/types";
import type { MerchantCategorizationService } from "@fresh-expense/utils";
import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("merchants")
@ApiBearerAuth()
@Controller("merchants")
@UseGuards(AuthGuard("jwt"))
export class MerchantController {
  constructor(private readonly merchantCategorizationService: MerchantCategorizationService) {}

  @Get(":merchantName/categorize")
  @ApiOperation({ summary: "Categorize a merchant" })
  @ApiResponse({
    status: 200,
    description: "Returns merchant categorization result",
  })
  async categorizeMerchant(
    @Param("merchantName") merchantName: string,
    @Query("sources") sources?: MerchantSource[],
  ) {
    // TODO: Get userId from request context
    const userId = "user123"; // Placeholder
    return this.merchantCategorizationService.categorizeMerchant(merchantName, userId, sources);
  }

  @Post("batch-categorize")
  @ApiOperation({ summary: "Categorize multiple merchants" })
  @ApiResponse({
    status: 200,
    description: "Returns categorization results for multiple merchants",
  })
  async batchCategorizeMerchants(
    @Body() body: { merchantNames: string[]; sources?: MerchantSource[] },
  ) {
    // TODO: Get userId from request context
    const userId = "user123"; // Placeholder
    const { merchantNames, sources } = body;

    const results = await Promise.all(
      merchantNames.map((merchantName) =>
        this.merchantCategorizationService.categorizeMerchant(merchantName, userId, sources),
      ),
    );

    return {
      results,
      total: results.length,
      success: results.filter((r) => r.confidence > 0.7).length,
    };
  }
}
