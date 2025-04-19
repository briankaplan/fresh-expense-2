import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { OCRService } from '../../services/ocr/ocr.service';

import { OCRController } from './ocr.controller';


export class OCRModule {}
