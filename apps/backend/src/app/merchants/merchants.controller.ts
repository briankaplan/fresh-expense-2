import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';



export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  
  create(@Body() createMerchantDto: CreateMerchantDto) {
    return this.merchantsService.create(createMerchantDto);
  }

  
  findAll(@Query() query: any) {
    return this.merchantsService.findAll(query);
  }

  
  findOne(@Param('id') id: string) {
    return this.merchantsService.findOne(id);
  }

  
  update(@Param('id') id: string, @Body() updateMerchantDto: UpdateMerchantDto) {
    return this.merchantsService.update(id, updateMerchantDto);
  }

  
  remove(@Param('id') id: string) {
    return this.merchantsService.remove(id);
  }

  
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.merchantsService.findByCategory(categoryId);
  }

  
  findByTellerMerchantId(@Param('tellerMerchantId') tellerMerchantId: string) {
    return this.merchantsService.findByTellerMerchantId(tellerMerchantId);
  }

  
  findNearby(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('maxDistance') maxDistance?: number
  ) {
    return this.merchantsService.findNearby(latitude, longitude, maxDistance);
  }

  
  getDefaultMerchants() {
    return this.merchantsService.getDefaultMerchants();
  }
}
