import type { MerchantDocument, PaginatedResponse } from "@fresh-expense/types";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { createPaginationParams, createSortOptions } from "@packages/utils";
import type { Model } from "mongoose";

import type { CreateMerchantDto } from "./dto/create-merchant.dto";
import type { UpdateMerchantDto } from "./dto/update-merchant.dto";

@Injectable()
export class MerchantsService {
  constructor(@InjectModel("Merchant") private merchantModel: Model<MerchantDocument>) {}

  async create(createMerchantDto: CreateMerchantDto): Promise<Merchant> {
    const createdMerchant = new this.merchantModel(createMerchantDto);
    return createdMerchant.save();
  }

  async findAll(
    query: any = {},
    page?: number,
    limit?: number,
    sort?: string,
  ): Promise<PaginatedResponse<Merchant>> {
    const pagination = createPaginationParams(page, limit);
    const sortOptions = sort ? createSortOptions(sort) : undefined;

    const [items, total] = await Promise.all([
      this.merchantModel
        .find(query)
        .sort(sortOptions)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .exec(),
      this.merchantModel.countDocuments(query).exec(),
    ]);

    return {
      items,
      total,
      page: page || 1,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async findOne(id: string): Promise<Merchant> {
    const merchant = await this.merchantModel.findById(id).exec();
    if (!merchant) {
      throw new NotFoundException("Merchant not found");
    }
    return merchant;
  }

  async update(id: string, updateMerchantDto: UpdateMerchantDto): Promise<Merchant> {
    const merchant = await this.merchantModel
      .findByIdAndUpdate(id, updateMerchantDto, { new: true })
      .exec();
    if (!merchant) {
      throw new NotFoundException("Merchant not found");
    }
    return merchant;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.merchantModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async findByCategory(
    categoryId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResponse<Merchant>> {
    return this.findAll({ categoryId }, page, limit);
  }

  async findByTellerMerchantId(tellerMerchantId: string): Promise<Merchant> {
    const merchant = await this.merchantModel.findOne({ tellerMerchantId }).exec();
    if (!merchant) {
      throw new NotFoundException("Merchant not found");
    }
    return merchant;
  }

  async findNearby(
    latitude: number,
    longitude: number,
    maxDistance = 5000,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResponse<Merchant>> {
    return this.findAll(
      {
        locations: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            $maxDistance: maxDistance,
          },
        },
      },
      page,
      limit,
    );
  }

  async getDefaultMerchants(): Promise<Merchant[]> {
    return this.merchantModel
      .find({
        name: { $in: ["Netflix", "Spotify", "Amazon"] },
      })
      .exec();
  }
}
