import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ReceiptService } from '../services/receipt/receipt.service';

@Controller('receipts')
@UseGuards(JwtAuthGuard)
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadReceipt(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { merchant: string; amount: string; transactionId?: string },
    @Request() req,
  ) {
    return this.receiptService.create({
      file: file.buffer,
      filename: file.originalname,
      mimeType: file.mimetype,
      merchant: body.merchant,
      amount: parseFloat(body.amount),
      userId: req.user.id,
      transactionId: body.transactionId,
    });
  }

  @Get()
  async getReceipts(@Query('search') search: string, @Request() req) {
    return this.receiptService.findByUserId(req.user.id, search);
  }

  @Get(':id')
  async getReceipt(@Param('id') id: string, @Request() req) {
    return this.receiptService.findById(id, req.user.id);
  }

  @Put(':id')
  async updateReceipt(
    @Param('id') id: string,
    @Body() body: { merchant?: string; amount?: string; transactionId?: string },
    @Request() req,
  ) {
    return this.receiptService.update(id, req.user.id, {
      merchant: body.merchant,
      amount: body.amount ? parseFloat(body.amount) : undefined,
      transactionId: body.transactionId,
    });
  }

  @Delete(':id')
  async deleteReceipt(@Param('id') id: string, @Request() req) {
    await this.receiptService.delete(id, req.user.id);
    return { success: true };
  }
} 