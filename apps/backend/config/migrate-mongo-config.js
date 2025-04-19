// In this file you can configure migrate-mongo
require("dotenv").config();

const config = {
  mongodb: {
    url:
      process.env.MONGODB_URI ||
      "mongodb+srv://kaplanbrian:G51AbXtGbwSsOXvo@expenses.kytpick.mongodb.net/?retryWrites=true&w=majority&appName=Expenses",
    databaseName: process.env.MONGODB_DB || "expenses",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  migrationsDir: "migrations",
  changelogCollectionName: "changelog",
  migrationFileExtension: ".js",
  useFileHash: false,
  moduleSystem: "commonjs",
};

module.exports = config;
