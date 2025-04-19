import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MerchantDocument } from '@fresh-expense/types';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';

@Injectable()
export class MerchantsService {
  constructor(@InjectModel(Merchant.name) private merchantModel: Model<MerchantDocument>) {}

  async create(createMerchantDto: CreateMerchantDto): Promise<Merchant> {
    const createdMerchant = new this.merchantModel(createMerchantDto);
    return createdMerchant.save();
  }

  async findAll(query: any = {}): Promise<Merchant[]> {
    return this.merchantModel.find(query).exec();
  }

  async findOne(id: string): Promise<Merchant> {
    return this.merchantModel.findById(id).exec();
  }

  async update(id: string, updateMerchantDto: UpdateMerchantDto): Promise<Merchant> {
    return this.merchantModel.findByIdAndUpdate(id, updateMerchantDto, { new: true }).exec();
  }

  async remove(id: string): Promise<Merchant> {
    return this.merchantModel.findByIdAndDelete(id).exec();
  }

  async findByCategory(categoryId: string): Promise<Merchant[]> {
    return this.merchantModel.find({ categoryId }).exec();
  }

  async findByTellerMerchantId(tellerMerchantId: string): Promise<Merchant> {
    return this.merchantModel.findOne({ tellerMerchantId }).exec();
  }

  async findNearby(
    latitude: number,
    longitude: number,
    maxDistance: number = 5000
  ): Promise<Merchant[]> {
    return this.merchantModel
      .find({
        locations: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: maxDistance,
          },
        },
      })
      .exec();
  }

  async getDefaultMerchants(): Promise<Merchant[]> {
    return this.merchantModel
      .find({
        name: { $in: ['Netflix', 'Spotify', 'Amazon'] },
      })
      .exec();
  }
}
