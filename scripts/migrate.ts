import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { MigrationModule } from '../apps/backend/src/database/migrations/migration.module';
import { MigrationService } from '../apps/backend/src/database/migrations/migration.service';

async function bootstrap() {
  const logger = new Logger('MigrationCLI');

  try {
    const app = await NestFactory.createApplicationContext(MigrationModule);
    const migrationService = app.get(MigrationService);

    const command = process.argv[2];
    const version = process.argv[3] ? parseInt(process.argv[3], 10) : undefined;

    switch (command) {
    case 'up':
      logger.log('Running migrations...');
      await migrationService.runMigrations();
      logger.log('Migrations completed successfully');
      break;

    case 'down':
      if (!version) {
        logger.error('Version number required for rollback');
        process.exit(1);
      }
      logger.log(`Rolling back to version ${version}...`);
      await migrationService.rollback(version);
      logger.log('Rollback completed successfully');
      break;

    default:
      logger.error('Invalid command. Use "up" or "down <version>"');
      process.exit(1);
    }

    await app.close();
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

bootstrap();
