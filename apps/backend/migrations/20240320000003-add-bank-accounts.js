module.exports = {
  async up(db) {
    // Create collections if they don't exist
    await db.createCollection('bankAccounts');
    await db.createCollection('transactions');

    // Bank Accounts Schema Validation
    await db.command({
      collMod: 'bankAccounts',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'accountId', 'name', 'type', 'balance'],
          properties: {
            userId: { bsonType: 'objectId' },
            accountId: { bsonType: 'string' },
            name: { bsonType: 'string' },
            type: { enum: ['checking', 'savings', 'credit', 'investment'] },
            balance: { bsonType: 'double' },
            currency: { bsonType: 'string' },
            institution: { bsonType: 'string' },
            isActive: { bsonType: 'bool' },
            lastSync: { bsonType: 'date' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' },
          },
        },
      },
    });

    // Transactions Schema Validation
    await db.command({
      collMod: 'transactions',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'accountId', 'amount', 'date', 'description'],
          properties: {
            userId: { bsonType: 'objectId' },
            accountId: { bsonType: 'string' },
            amount: { bsonType: 'double' },
            date: { bsonType: 'date' },
            description: { bsonType: 'string' },
            category: { bsonType: 'string' },
            merchant: { bsonType: 'string' },
            type: { enum: ['debit', 'credit'] },
            status: { enum: ['pending', 'posted', 'cancelled'] },
            notes: { bsonType: 'string' },
            attachments: {
              bsonType: 'array',
              items: { bsonType: 'string' },
            },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' },
          },
        },
      },
    });

    // Create indexes for Bank Accounts
    await db.collection('bankAccounts').createIndexes([
      { key: { userId: 1 }, name: 'userId' },
      { key: { 'institution.id': 1 }, name: 'institutionId' },
      { key: { 'tellerData.accountId': 1 }, unique: true, sparse: true, name: 'unique_tellerId' },
      { key: { status: 1 }, name: 'status' },
      { key: { type: 1 }, name: 'accountType' },
      { key: { userId: 1, 'institution.id': 1 }, name: 'userId_institution' },
    ]);
  },

  async down(db) {
    await db.dropCollection('bankAccounts');
    await db.dropCollection('transactions');
  },
};
