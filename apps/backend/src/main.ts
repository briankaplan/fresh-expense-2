/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NotificationExceptionFilter } from './services/notification/filters/notification-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.use(compression());

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        status: 429,
        message: 'Too many requests, please try again later.',
      },
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    })
  );

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: errors => {
        const result = errors.map(error => ({
          property: error.property,
          message: error.constraints
            ? error.constraints[Object.keys(error.constraints)[0]]
            : 'Invalid value',
        }));
        return {
          status: 422,
          message: 'Validation failed',
          details: result,
        };
      },
    })
  );

  // Global exception filter
  app.useGlobalFilters(new NotificationExceptionFilter());

  // CORS
  app.enableCors({
    origin: configService.get('app.corsOrigin', '*'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // API prefix
  const apiPrefix = configService.get('app.apiPrefix', 'api');
  app.setGlobalPrefix(apiPrefix);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Fresh Expense API')
    .setDescription('The Fresh Expense API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Use environment PORT or fallback to config service
  const port = process.env['PORT']
    ? parseInt(process.env['PORT'], 10)
    : configService.get<number>('app.port', 3000);
  await app.listen(port);

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger documentation available at: ${await app.getUrl()}/api`);
}

bootstrap();
