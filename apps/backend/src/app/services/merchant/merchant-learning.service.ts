import type { IMerchantLearningService, MerchantData } from "@fresh-expense/types";
import type { MerchantDocument } from "@fresh-expense/types";
import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";

@Injectable()
export class MerchantLearningService implements IMerchantLearningService {
  private readonly logger = new Logger(MerchantLearningService.name);

  constructor(@InjectModel("Merchant") private merchantModel: Model<MerchantDocument>) {}

  async getMerchantData(merchantName: string): Promise<MerchantData> {
    try {
      const merchant = await this.merchantModel.findOne({ name: merchantName });
      if (!merchant) {
        return {
          confidence: 0,
          tags: [],
          description: merchantName,
        };
      }

      return {
        category: merchant.category,
        company: merchant.company,
        confidence: merchant.confidence || 0,
        tags: merchant.tags || [],
        description: merchant.description || merchantName,
      };
    } catch (error) {
      this.logger.error(`Failed to get merchant data for ${merchantName}: ${error.message}`);
      return {
        confidence: 0,
        tags: [],
        description: merchantName,
      };
    }
  }

  async learnFromTransaction(merchantName: string, data: Partial<MerchantData>): Promise<void> {
    try {
      const merchant = await this.merchantModel.findOne({ name: merchantName });
      if (!merchant) {
        await this.merchantModel.create({
          name: merchantName,
          ...data,
          confidence: data.confidence || 0.5,
        });
        return;
      }

      // Update merchant data with new information
      if (data.category && (!merchant.category || merchant.confidence < data.confidence)) {
        merchant.category = data.category;
        merchant.confidence = data.confidence;
      }

      if (data.company && (!merchant.company || merchant.confidence < data.confidence)) {
        merchant.company = data.company;
        merchant.confidence = data.confidence;
      }

      if (data.tags) {
        merchant.tags = [...new Set([...(merchant.tags || []), ...data.tags])];
      }

      if (data.description && (!merchant.description || merchant.confidence < data.confidence)) {
        merchant.description = data.description;
      }

      await merchant.save();
    } catch (error) {
      this.logger.error(`Failed to learn from transaction for ${merchantName}: ${error.message}`);
    }
  }

  async getMerchantSuggestions(merchantName: string): Promise<MerchantData[]> {
    try {
      const merchants = await this.merchantModel
        .find({
          name: { $regex: merchantName, $options: "i" },
        })
        .sort({ confidence: -1 })
        .limit(5);

      return merchants.map((merchant) => ({
        category: merchant.category,
        company: merchant.company,
        confidence: merchant.confidence || 0,
        tags: merchant.tags || [],
        description: merchant.description || merchant.name,
      }));
    } catch (error) {
      this.logger.error(`Failed to get merchant suggestions for ${merchantName}: ${error.message}`);
      return [];
    }
  }
}
