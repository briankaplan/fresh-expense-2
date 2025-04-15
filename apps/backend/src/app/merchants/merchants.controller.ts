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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('merchants')
@UseGuards(JwtAuthGuard)
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Post()
  create(@Body() createMerchantDto: CreateMerchantDto) {
    return this.merchantsService.create(createMerchantDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.merchantsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.merchantsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMerchantDto: UpdateMerchantDto) {
    return this.merchantsService.update(id, updateMerchantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.merchantsService.remove(id);
  }

  @Get('category/:categoryId')
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.merchantsService.findByCategory(categoryId);
  }

  @Get('teller/:tellerMerchantId')
  findByTellerMerchantId(@Param('tellerMerchantId') tellerMerchantId: string) {
    return this.merchantsService.findByTellerMerchantId(tellerMerchantId);
  }

  @Get('nearby')
  findNearby(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('maxDistance') maxDistance?: number
  ) {
    return this.merchantsService.findNearby(latitude, longitude, maxDistance);
  }

  @Get('default')
  getDefaultMerchants() {
    return this.merchantsService.getDefaultMerchants();
  }
}
