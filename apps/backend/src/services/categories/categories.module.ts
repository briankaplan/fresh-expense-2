import { Module } from '@nestjs/common';

import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

import { MongoDBModule } from '@/core/database/mongodb.module';


export class CategoriesModule {}
