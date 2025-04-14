import { Controller, Post, Headers, Body, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import { TellerService } from '../teller.service';
import { Logger } from '@nestjs/common';

@Controller('webhooks/teller')
export class TellerWebhookController {
  private readonly logger = new Logger(TellerWebhookController.name);

  constructor(private readonly tellerService: TellerService) {}

  @Post()
  async handleWebhook(
    @Headers('x-teller-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
    @Body() payload: any
  ) {
    this.logger.log('Received Teller webhook');

    try {
      if (!request.rawBody) {
        this.logger.warn('No raw body found in request');
        return { status: 'error', message: 'No request body' };
      }

      // Verify the signature
      const isValid = await this.tellerService.verifyWebhookSignature(
        signature,
        request.rawBody.toString()
      );

      if (!isValid) {
        this.logger.warn('Invalid webhook signature');
        return { status: 'error', message: 'Invalid signature' };
      }

      // Process the webhook based on its type
      switch (payload.type) {
        case 'transaction.created':
          await this.tellerService.handleTransactionCreated(payload.data);
          break;
        case 'transaction.updated':
          await this.tellerService.handleTransactionUpdated(payload.data);
          break;
        case 'account.updated':
          await this.tellerService.handleAccountUpdated(payload.data);
          break;
        default:
          this.logger.warn(`Unhandled webhook type: ${payload.type}`);
      }

      return { status: 'success' };
    } catch (error) {
      this.logger.error('Error processing webhook:', error instanceof Error ? error.message : 'Unknown error');
      return { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
} 