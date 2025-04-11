import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription, SubscriptionDocument, SubscriptionStatus, BillingCycle } from './schemas/subscription.schema';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    // Validate that the subscription doesn't already exist for this merchant and user
    const existingSubscription = await this.subscriptionModel.findOne({
      userId: createSubscriptionDto.userId,
      merchantId: createSubscriptionDto.merchantId,
      status: { $ne: SubscriptionStatus.CANCELLED }
    }).exec();

    if (existingSubscription) {
      throw new BadRequestException('A subscription for this merchant already exists');
    }

    const subscription = new this.subscriptionModel(createSubscriptionDto);
    return subscription.save();
  }

  async findAll(userId: string): Promise<Subscription[]> {
    return this.subscriptionModel.find({ userId }).exec();
  }

  async findOne(id: string, userId: string): Promise<Subscription> {
    const subscription = await this.subscriptionModel.findOne({ _id: id, userId }).exec();
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return subscription;
  }

  async update(id: string, userId: string, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Subscription> {
    const subscription = await this.subscriptionModel.findOne({ _id: id, userId }).exec();
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    // Handle status transitions
    if (updateSubscriptionDto.status) {
      this.validateStatusTransition(subscription.status, updateSubscriptionDto.status);
    }

    // Update the subscription
    Object.assign(subscription, updateSubscriptionDto);
    return subscription.save();
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.subscriptionModel.deleteOne({ _id: id, userId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
  }

  async findByUserId(userId: string, query: any = {}): Promise<Subscription[]> {
    return this.subscriptionModel.find({ userId, ...query }).exec();
  }

  async findByCompanyId(companyId: string, query: any = {}): Promise<Subscription[]> {
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

    if (subscription.status === SubscriptionStatus.CANCELLED) {
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

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processSubscriptions() {
    const today = new Date();
    const activeSubscriptions = await this.subscriptionModel.find({
      status: SubscriptionStatus.ACTIVE,
      nextBillingDate: { $lte: today },
    }).exec();

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
        subscriptionId: subscription._id
      };

      // Update subscription with new billing dates
      const nextBillingDate = this.calculateNextBillingDate(subscription);
      await this.subscriptionModel.findByIdAndUpdate(
        subscription._id,
        {
          lastBillingDate: new Date(),
          nextBillingDate,
        }
      ).exec();

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

  private validateStatusTransition(currentStatus: SubscriptionStatus, newStatus: SubscriptionStatus): void {
    const validTransitions = {
      [SubscriptionStatus.ACTIVE]: [SubscriptionStatus.PAUSED, SubscriptionStatus.CANCELLED],
      [SubscriptionStatus.PAUSED]: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLED],
      [SubscriptionStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
} 