const { database } = require('migrate-mongo');
const path = require('path');

// Load the config file
require('../../migrate-mongo-config');

async function runMigrations() {
  try {
    // Get the database instance
    const { db, client } = await database.connect();

    // Get migration status
    const migrated = await database.getMigratedVersions(db);
    console.log('Already migrated:', migrated);

    // Run pending migrations
    const { migrated: newMigrations, fileName } = await database.up(db);
    console.log('New migrations:', newMigrations);

    // Close the connection
    await client.close();

    if (newMigrations.length > 0) {
      console.log('Database migrations completed successfully');
    } else {
      console.log('No pending migrations');
    }
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

// Run migrations if this script is run directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
