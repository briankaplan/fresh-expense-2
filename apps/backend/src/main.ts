/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.use(compression());

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // CORS
  app.enableCors({
    origin: configService.get('app.corsOrigin', '*'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // API prefix
  const apiPrefix = configService.get('app.apiPrefix', 'api');
  app.setGlobalPrefix(apiPrefix);

  // Use environment PORT or fallback to config service
  const port = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : configService.get<number>('app.port', 3000);
  await app.listen(port);
  
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
