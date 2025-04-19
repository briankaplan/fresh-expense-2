import { getDb } from '@/core/database';

async function setupDatabase() {
  try {
    const db = await getDb();

    // Create indexes for expenses collection
    await db.collection('expenses').createIndexes([
      { key: { date: 1 }, name: 'date_idx' },
      { key: { category: 1 }, name: 'category_idx' },
      { key: { company: 1 }, name: 'company_idx' },
      { key: { merchant: 1 }, name: 'merchant_idx' },
      { key: { tags: 1 }, name: 'tags_idx' },
      { key: { amount: { value: 1, currency: 'USD' } }, name: 'amount_idx' },
      // Compound indexes for common queries
      { key: { company: 1, date: -1 }, name: 'company_date_idx' },
      { key: { category: 1, date: -1 }, name: 'category_date_idx' },
    ]);

    // Create indexes for transactions collection
    await db.collection('transactions').createIndexes([
      { key: { date: 1 }, name: 'date_idx' },
      { key: { category: 1 }, name: 'category_idx' },
      { key: { type: 1 }, name: 'type_idx' },
      { key: { amount: { value: 1, currency: 'USD' } }, name: 'amount_idx' },
      // Compound indexes for common queries
      { key: { type: 1, date: -1 }, name: 'type_date_idx' },
      { key: { category: 1, date: -1 }, name: 'category_date_idx' },
    ]);

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

// Add schema validation rules
async function setupSchemaValidation() {
  try {
    const db = await getDb();

    // Expense collection validation
    await db.command({
      collMod: 'expenses',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['date', 'amount', 'category', 'company'],
          properties: {
            date: { bsonType: 'string' },
            description: { bsonType: 'string' },
            amount: { bsonType: 'number' },
            category: { bsonType: 'string' },
            merchant: { bsonType: 'string' },
            status: { bsonType: 'string' },
            company: { bsonType: 'string' },
            tags: {
              bsonType: 'array',
              items: { bsonType: 'string' },
            },
            receiptUrl: { bsonType: ['string', 'null'] },
          },
        },
      },
      validationLevel: 'moderate',
      validationAction: 'warn',
    });

    // Transaction collection validation
    await db.command({
      collMod: 'transactions',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['date', 'amount', 'type', 'category'],
          properties: {
            date: { bsonType: 'string' },
            description: { bsonType: 'string' },
            amount: { bsonType: 'number' },
            category: { bsonType: 'string' },
            status: { bsonType: 'string' },
            type: {
              bsonType: 'string',
              enum: ['income', 'expense'],
            },
          },
        },
      },
      validationLevel: 'moderate',
      validationAction: 'warn',
    });

    console.log('Schema validation setup completed successfully');
  } catch (error) {
    console.error('Error setting up schema validation:', error);
    process.exit(1);
  }
}

// Run setup
async function init() {
  await setupDatabase();
  await setupSchemaValidation();
}

// Only run if this file is executed directly
if (require.main != null) {
  init().catch(console.error);
}

export { init as setupDb };
