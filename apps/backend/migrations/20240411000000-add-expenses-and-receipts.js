const { CATEGORY_METADATA } = require('@fresh-expense/types');

module.exports = {
  async up(db) {
    // Create collections if they don't exist
    await db.createCollection('expenses');
    await db.createCollection('receipts');
    await db.createCollection('categories');
    await db.createCollection('tags');

    // Expenses Schema Validation
    await db.command({
      collMod: 'expenses',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'amount', 'date', 'description', 'categoryId'],
          properties: {
            userId: { bsonType: 'objectId' },
            companyId: { bsonType: 'objectId' },
            amount: { bsonType: 'double' },
            date: { bsonType: 'date' },
            description: { bsonType: 'string' },
            categoryId: { bsonType: 'objectId' },
            tags: {
              bsonType: 'array',
              items: { bsonType: 'objectId' },
            },
            receiptId: { bsonType: 'objectId' },
            transactionId: { bsonType: 'string' },
            status: { enum: ['pending', 'approved', 'rejected', 'reimbursed'] },
            paymentMethod: { enum: ['cash', 'card', 'bank_transfer', 'other'] },
            notes: { bsonType: 'string' },
            location: {
              bsonType: 'object',
              properties: {
                address: { bsonType: 'string' },
                coordinates: {
                  bsonType: 'array',
                  items: { bsonType: 'double' },
                },
              },
            },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' },
          },
        },
      },
    });

    // Receipts Schema Validation
    await db.command({
      collMod: 'receipts',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'fileUrl', 'mimeType'],
          properties: {
            userId: { bsonType: 'objectId' },
            fileUrl: { bsonType: 'string' },
            thumbnailUrl: { bsonType: 'string' },
            mimeType: { bsonType: 'string' },
            size: { bsonType: 'int' },
            metadata: {
              bsonType: 'object',
              properties: {
                merchant: { bsonType: 'string' },
                date: { bsonType: 'date' },
                total: { bsonType: 'double' },
                items: {
                  bsonType: 'array',
                  items: {
                    bsonType: 'object',
                    properties: {
                      description: { bsonType: 'string' },
                      amount: { bsonType: 'double' },
                      quantity: { bsonType: 'int' },
                    },
                  },
                },
                taxAmount: { bsonType: 'double' },
                tipAmount: { bsonType: 'double' },
              },
            },
            ocrStatus: { enum: ['pending', 'processing', 'completed', 'failed'] },
            ocrData: { bsonType: 'object' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' },
          },
        },
      },
    });

    // Categories Schema Validation
    await db.command({
      collMod: 'categories',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'type'],
          properties: {
            name: { bsonType: 'string' },
            type: { enum: ['expense', 'income'] },
            icon: { bsonType: 'string' },
            color: { bsonType: 'string' },
            parentId: { bsonType: 'objectId' },
            isSystem: { bsonType: 'bool' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' },
          },
        },
      },
    });

    // Tags Schema Validation
    await db.command({
      collMod: 'tags',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'userId'],
          properties: {
            name: { bsonType: 'string' },
            userId: { bsonType: 'objectId' },
            color: { bsonType: 'string' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' },
          },
        },
      },
    });

    // Create indexes
    await db
      .collection('expenses')
      .createIndexes([
        { key: { userId: 1 } },
        { key: { companyId: 1 } },
        { key: { categoryId: 1 } },
        { key: { date: -1 } },
        { key: { status: 1 } },
        { key: { 'location.coordinates': '2dsphere' } },
      ]);

    await db
      .collection('receipts')
      .createIndexes([
        { key: { userId: 1 } },
        { key: { ocrStatus: 1 } },
        { key: { 'metadata.merchant': 1 } },
        { key: { 'metadata.date': -1 } },
      ]);

    await db
      .collection('categories')
      .createIndexes([
        { key: { name: 1 }, unique: true },
        { key: { type: 1 } },
        { key: { parentId: 1 } },
      ]);

    await db.collection('tags').createIndexes([{ key: { userId: 1, name: 1 }, unique: true }]);

    // Insert default categories
    const defaultCategories = Object.entries(CATEGORY_METADATA).map(([type, metadata]) => ({
      type,
      name: metadata.name,
      icon: metadata.icon,
      color: metadata.color,
      description: metadata.description,
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await db.collection('categories').insertMany(defaultCategories);
  },

  async down(db) {
    await db.dropCollection('expenses');
    await db.dropCollection('receipts');
    await db.dropCollection('categories');
    await db.dropCollection('tags');
  },
};
