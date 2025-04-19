Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const migration_module_1 = require("../apps/backend/src/database/migrations/migration.module");
const migration_service_1 = require("../apps/backend/src/database/migrations/migration.service");
async function bootstrap() {
  const logger = new common_1.Logger("MigrationCLI");
  try {
    const app = await core_1.NestFactory.createApplicationContext(
      migration_module_1.MigrationModule,
    );
    const migrationService = app.get(migration_service_1.MigrationService);
    const command = process.argv[2];
    const version = process.argv[3] ? Number.parseInt(process.argv[3], 10) : undefined;
    switch (command) {
      case "up":
        logger.log("Running migrations...");
        await migrationService.runMigrations();
        logger.log("Migrations completed successfully");
        break;
      case "down":
        if (!version) {
          logger.error("Version number required for rollback");
          process.exit(1);
        }
        logger.log(`Rolling back to version ${version}...`);
        await migrationService.rollback(version);
        logger.log("Rollback completed successfully");
        break;
      default:
        logger.error('Invalid command. Use "up" or "down <version>"');
        process.exit(1);
    }
    await app.close();
  } catch (error) {
    logger.error("Migration failed:", error);
    process.exit(1);
  }
}
bootstrap();
//# sourceMappingURL=migrate.js.map
