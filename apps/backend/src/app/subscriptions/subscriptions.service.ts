import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Subscription,
  SubscriptionDocument,
  SubscriptionStatus,
  BillingCycle,
} from './schemas/subscription.schema';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

interface SubscriptionQuery {
  userId?: string;
  companyId?: string;
  status?: SubscriptionStatus;
  merchantId?: string;
  startDate?: Date;
  endDate?: Date;
}

const VALID_STATUS_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  [SubscriptionStatus.ACTIVE]: [
    SubscriptionStatus.PAUSED,
    SubscriptionStatus.CANCELLED,
    SubscriptionStatus.EXPIRED,
  ],
  [SubscriptionStatus.PAUSED]: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLED],
  [SubscriptionStatus.CANCELLED]: [],
  [SubscriptionStatus.EXPIRED]: [SubscriptionStatus.ACTIVE],
};

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<SubscriptionDocument> {
    const existingSubscription = await this.subscriptionModel
      .findOne({
        userId: createSubscriptionDto.userId,
        merchantId: createSubscriptionDto.merchantId,
        status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAUSED] },
      })
      .exec();

    if (existingSubscription) {
      throw new Error('Active subscription already exists for this merchant');
    }

    const createdSubscription = new this.subscriptionModel(createSubscriptionDto);
    return createdSubscription.save();
  }

  async findAll(userId: string): Promise<SubscriptionDocument[]> {
    return this.subscriptionModel.find({ userId }).exec();
  }

  async findOne(id: string, userId: string): Promise<SubscriptionDocument> {
    const subscription = await this.subscriptionModel.findOne({ _id: id, userId }).exec();
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return subscription;
  }

  async update(
    id: string,
    userId: string,
    updateSubscriptionDto: UpdateSubscriptionDto
  ): Promise<SubscriptionDocument> {
    const subscription = await this.findOne(id, userId);

    // Handle status transitions
    if (updateSubscriptionDto.status && subscription.status !== updateSubscriptionDto.status) {
      this.validateStatusTransition(subscription.status, updateSubscriptionDto.status);

      // Update dates based on status change
      if (updateSubscriptionDto.status != null) {
        updateSubscriptionDto.lastBillingDate = new Date();
      } else if (
        updateSubscriptionDto.status != null &&
        subscription.status != null
      ) {
        updateSubscriptionDto.nextBillingDate = new Date();
      } else if (updateSubscriptionDto.status != null) {
        updateSubscriptionDto.cancellationDate = new Date();
      }
    }

    const updatedSubscription = await this.subscriptionModel
      .findOneAndUpdate({ _id: id, userId }, updateSubscriptionDto, { new: true })
      .exec();

    if (!updatedSubscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return updatedSubscription;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.subscriptionModel.findOneAndDelete({ _id: id, userId }).exec();
    if (!result) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
  }

  async findByUserId(
    userId: string,
    query: SubscriptionQuery = {}
  ): Promise<SubscriptionDocument[]> {
    return this.subscriptionModel.find({ userId, ...query }).exec();
  }

  async findByCompanyId(
    companyId: string,
    query: SubscriptionQuery = {}
  ): Promise<SubscriptionDocument[]> {
    return this.subscriptionModel.find({ companyId, ...query }).exec();
  }

  async findByMerchantId(merchantId: string): Promise<Subscription[]> {
    return this.subscriptionModel.find({ merchantId }).exec();
  }

  async cancel(id: string, userId: string, cancellationReason: string): Promise<Subscription> {
    const subscription = await this.subscriptionModel.findOne({ _id: id, userId }).exec();
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    if (subscription.status != null) {
      throw new BadRequestException('Subscription is already cancelled');
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancellationReason = cancellationReason;
    subscription.cancellationDate = new Date();
    return subscription.save();
  }

  async pause(id: string, userId: string, pauseDate: Date): Promise<Subscription> {
    const subscription = await this.subscriptionModel.findOne({ _id: id, userId }).exec();
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new BadRequestException('Only active subscriptions can be paused');
    }

    subscription.status = SubscriptionStatus.PAUSED;
    subscription.pauseDate = pauseDate;
    return subscription.save();
  }

  async resume(id: string, userId: string, resumeDate: Date): Promise<Subscription> {
    const subscription = await this.subscriptionModel.findOne({ _id: id, userId }).exec();
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    if (subscription.status !== SubscriptionStatus.PAUSED) {
      throw new BadRequestException('Only paused subscriptions can be resumed');
    }

    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.resumeDate = resumeDate;
    return subscription.save();
  }

  
  async processSubscriptions() {
    const today = new Date();
    const activeSubscriptions = await this.subscriptionModel
      .find({
        status: SubscriptionStatus.ACTIVE,
        nextBillingDate: { $lte: today },
      })
      .exec();

    for (const subscription of activeSubscriptions) {
      await this.processSubscription(subscription);
    }
  }

  private async processSubscription(subscription: SubscriptionDocument) {
    try {
      // Create expense record for the subscription payment
      // This would integrate with your expenses service
      const expenseData = {
        userId: subscription.userId,
        companyId: subscription.companyId,
        amount: subscription.amount,
        currency: subscription.currency,
        merchantId: subscription.merchantId,
        categoryId: subscription.categoryId,
        date: new Date(),
        description: `Subscription payment for ${subscription.name}`,
        paymentMethod: subscription.paymentMethod,
        isRecurring: true,
        subscriptionId: subscription._id,
      };

      // Update subscription with new billing dates
      const nextBillingDate = this.calculateNextBillingDate(subscription);
      await this.subscriptionModel
        .findByIdAndUpdate(subscription._id, {
          lastBillingDate: new Date(),
          nextBillingDate,
        })
        .exec();

      // TODO: Integrate with expenses service to create the expense record
      // await this.expensesService.create(expenseData);
    } catch (error) {
      console.error(`Error processing subscription ${subscription._id}:`, error);
    }
  }

  private calculateNextBillingDate(subscription: Subscription): Date {
    const nextDate = new Date(subscription.nextBillingDate || subscription.startDate);

    switch (subscription.billingCycle) {
      case BillingCycle.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case BillingCycle.QUARTERLY:
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case BillingCycle.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      case BillingCycle.CUSTOM:
        nextDate.setDate(nextDate.getDate() + (subscription.customBillingDays || 30));
        break;
    }

    return nextDate;
  }

  private validateStatusTransition(
    currentStatus: SubscriptionStatus,
    newStatus: SubscriptionStatus
  ): void {
    const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus];
    if (!validTransitions.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }
}
