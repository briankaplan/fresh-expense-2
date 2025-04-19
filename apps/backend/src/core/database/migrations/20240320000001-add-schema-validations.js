module.exports = {
  async up(db) {
    // Transaction Schema Validation
    await db.command({
      collMod: 'transactions',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'accountId', 'date', 'amount', 'description', 'type', 'status'],
          properties: {
            userId: { bsonType: 'string' },
            accountId: { bsonType: 'string' },
            date: { bsonType: 'date' },
            amount: { bsonType: 'number' },
            description: { bsonType: 'string' },
            type: { enum: ['credit', 'debit', 'transfer'] },
            status: { enum: ['pending', 'posted', 'cancelled'] },
            category: { bsonType: 'string' },
            isExpense: { bsonType: 'bool' },
            company: { enum: ['Down Home', 'Music City Rodeo', 'Personal'] },
          },
        },
      },
      validationLevel: 'moderate',
    });

    // Receipt Schema Validation
    await db.command({
      collMod: 'receipts',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['expenseId', 'userId', 'urls', 'source', 'merchant', 'amount', 'date'],
          properties: {
            expenseId: { bsonType: 'objectId' },
            userId: { bsonType: 'objectId' },
            urls: {
              bsonType: 'object',
              required: ['original'],
              properties: {
                original: { bsonType: 'string' },
                converted: { bsonType: 'string' },
                thumbnail: { bsonType: 'string' },
              },
            },
            source: { enum: ['CSV', 'EMAIL', 'GOOGLE_PHOTOS', 'MANUAL', 'UPLOAD'] },
            merchant: { bsonType: 'string' },
            amount: { bsonType: 'number' },
            date: { bsonType: 'date' },
            category: { bsonType: 'string' },
          },
        },
      },
      validationLevel: 'moderate',
    });

    // Merchant Schema Validation
    await db.command({
      collMod: 'merchants',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name'],
          properties: {
            name: { bsonType: 'string' },
            aliases: { bsonType: 'array', items: { bsonType: 'string' } },
            category: { bsonType: 'string' },
            tags: { bsonType: 'array', items: { bsonType: 'string' } },
            businessDetails: {
              bsonType: 'object',
              properties: {
                website: { bsonType: 'string' },
                phone: { bsonType: 'string' },
                address: { bsonType: 'string' },
                taxId: { bsonType: 'string' },
              },
            },
          },
        },
      },
      validationLevel: 'moderate',
    });

    // Expense Schema Validation
    await db.command({
      collMod: 'expenses',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['transactionDate', 'amount', 'description'],
          properties: {
            transactionDate: { bsonType: 'date' },
            amount: { bsonType: 'number' },
            description: { bsonType: 'string' },
            merchant: { bsonType: 'string' },
            category: { bsonType: 'string' },
            receiptStatus: { enum: ['FOUND', 'MISSING', 'PROCESSING'] },
            companyId: { bsonType: 'string' },
          },
        },
      },
      validationLevel: 'moderate',
    });
  },

  async down(db) {
    // Remove validations by setting empty validator
    const collections = ['transactions', 'receipts', 'merchants', 'expenses'];
    for (const collection of collections) {
      await db.command({
        collMod: collection,
        validator: {},
        validationLevel: 'off',
      });
    }
  },
};
