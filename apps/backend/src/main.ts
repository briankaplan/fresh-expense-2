/**
 * Main entry point for the Fresh Expense backend application
 * Sets up the NestJS application with security, validation, and documentation
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';

import { AppModule } from './app/app.module';
import { NotificationExceptionFilter } from './services/notification/filters/notification-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    logger.log('Starting Fresh Expense backend application...');
    
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const configService = app.get(ConfigService);

    // Security
    logger.debug('Configuring security middleware...');
    app.use(helmet());
    app.use(compression());

    // Rate limiting
    logger.debug('Configuring rate limiting...');
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
      }),
    );

    // Validation
    logger.debug('Configuring validation pipe...');
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
      }),
    );

    // Global exception filter
    logger.debug('Configuring global exception filter...');
    app.useGlobalFilters(new NotificationExceptionFilter());

    // CORS
    logger.debug('Configuring CORS...');
    app.enableCors({
      origin: configService.get('app.corsOrigin', '*'),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    });

    // API prefix
    const apiPrefix = configService.get('app.apiPrefix', 'api');
    app.setGlobalPrefix(apiPrefix);
    logger.debug(`API prefix set to: ${apiPrefix}`);

    // Swagger configuration
    logger.debug('Configuring Swagger documentation...');
    const config = new DocumentBuilder()
      .setTitle('Fresh Expense API')
      .setDescription('The Fresh Expense API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // Use environment PORT or fallback to config service
    const port = process.env.PORT
      ? parseInt(process.env.PORT, 10)
      : configService.get<number>('app.port', 3000);
    
    await app.listen(port);
    logger.log(`Application is running on: ${await app.getUrl()}`);
    logger.log(`Swagger documentation available at: ${await app.getUrl()}/api`);
  } catch (error) {
    logger.error('Failed to start application', error instanceof Error ? error.stack : undefined);
    process.exit(1);
  }
}

bootstrap();
