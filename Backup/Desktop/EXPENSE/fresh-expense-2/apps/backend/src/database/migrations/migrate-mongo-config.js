// In this file you can configure migrate-mongo
require('dotenv').config({ path: '../../.env' });

const config = {
  mongodb: {
    url: process.env.DATABASE_URL || "mongodb://localhost:27017/expense-tracker",
    databaseName: process.env.MONGODB_DB || "expense-v2",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  migrationsDir: "migrations",
  changelogCollectionName: "changelog",
  migrationFileExtension: ".js",
  useFileHash: false,
  moduleSystem: 'commonjs',
};

module.exports = config; 