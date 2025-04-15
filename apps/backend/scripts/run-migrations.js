const { MongoClient } = require('mongodb');
require('dotenv').config();

async function createCollectionsIfNotExist(db) {
  const collections = [
    'users',
    'companies',
    'analytics',
    'transactions',
    'receipts',
    'merchants',
    'expenses',
    'bankAccounts',
  ];

  for (const collection of collections) {
    try {
      await db.createCollection(collection);
      console.log(`Created collection: ${collection}`);
    } catch (error) {
      if (error.code === 48) {
        // Collection already exists
        console.log(`Collection ${collection} already exists`);
      } else {
        throw error;
      }
    }
  }
}

async function runMigrations() {
  const url = process.env.DATABASE_URL;
  const dbName = process.env.MONGODB_DB;

  if (!url || !dbName) {
    console.error('Database configuration missing. Please check your .env file');
    process.exit(1);
  }

  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);

    // Create collections first
    console.log('\nCreating collections...');
    await createCollectionsIfNotExist(db);

    // Array of migration files in order
    const migrations = [
      require('../migrations/20240320000000-create-indexes.js'),
      require('../migrations/20240320000001-add-schema-validations.js'),
      require('../migrations/20240320000002-add-user-company-analytics.js'),
      require('../migrations/20240320000003-add-bank-accounts.js'),
    ];

    // Run migrations in sequence
    for (const [index, migration] of migrations.entries()) {
      console.log(`\nRunning migration ${index + 1}/${migrations.length}...`);
      try {
        await migration.up(db);
        console.log('Migration completed successfully');
      } catch (error) {
        console.error('Migration failed:', error);
        // Attempt to run down migration to rollback changes
        try {
          console.log('Attempting to rollback...');
          await migration.down(db);
          console.log('Rollback successful');
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
        process.exit(1);
      }
    }

    console.log('\nAll migrations completed successfully!');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

runMigrations().catch(console.error);
