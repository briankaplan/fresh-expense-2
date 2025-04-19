import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { MerchantCategorizationService } from '@fresh-expense/utils';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MerchantSource } from '@fresh-expense/types';

@ApiTags('merchants')
@ApiBearerAuth()
@Controller('merchants')
@UseGuards(AuthGuard('jwt'))
export class MerchantController {
  constructor(private readonly merchantCategorizationService: MerchantCategorizationService) {}

  @Get(':merchantName/categorize')
  @ApiOperation({ summary: 'Categorize a merchant' })
  @ApiResponse({ status: 200, description: 'Returns merchant categorization result' })
  async categorizeMerchant(
    @Param('merchantName') merchantName: string,
    @Query('sources') sources?: MerchantSource[]
  ) {
    // TODO: Get userId from request context
    const userId = 'user123'; // Placeholder
    return this.merchantCategorizationService.categorizeMerchant(merchantName, userId, sources);
  }

  @Post('batch-categorize')
  @ApiOperation({ summary: 'Categorize multiple merchants' })
  @ApiResponse({
    status: 200,
    description: 'Returns categorization results for multiple merchants',
  })
  async batchCategorizeMerchants(
    @Body() body: { merchantNames: string[]; sources?: MerchantSource[] }
  ) {
    // TODO: Get userId from request context
    const userId = 'user123'; // Placeholder
    const { merchantNames, sources } = body;

    const results = await Promise.all(
      merchantNames.map(merchantName =>
        this.merchantCategorizationService.categorizeMerchant(merchantName, userId, sources)
      )
    );

    return {
      results,
      total: results.length,
      success: results.filter(r => r.confidence > 0.7).length,
    };
  }
}
