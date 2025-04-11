module.exports = {
  async up(db) {
    // Bank Account Schema Validation
    await db.command({
      collMod: 'bankAccounts',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'name', 'type', 'institution', 'lastFour', 'status'],
          properties: {
            userId: { bsonType: 'string' },
            name: { bsonType: 'string' },
            type: { enum: ['checking', 'savings', 'credit', 'investment', 'loan', 'other'] },
            subtype: { bsonType: 'string' },
            institution: {
              bsonType: 'object',
              required: ['name', 'id'],
              properties: {
                name: { bsonType: 'string' },
                id: { bsonType: 'string' },
                logo: { bsonType: 'string' }
              }
            },
            lastFour: { bsonType: 'string' },
            status: { enum: ['active', 'inactive', 'error'] },
            balance: {
              bsonType: 'object',
              required: ['current', 'available', 'lastUpdated'],
              properties: {
                current: { bsonType: 'number' },
                available: { bsonType: 'number' },
                lastUpdated: { bsonType: 'date' }
              }
            },
            tellerData: {
              bsonType: 'object',
              properties: {
                accountId: { bsonType: 'string' },
                enrollmentId: { bsonType: 'string' },
                status: { bsonType: 'string' },
                lastSynced: { bsonType: 'date' }
              }
            },
            metadata: {
              bsonType: 'object',
              properties: {
                lastTransactionSync: { bsonType: 'date' },
                transactionCount: { bsonType: 'int' },
                error: {
                  bsonType: 'object',
                  properties: {
                    code: { bsonType: 'string' },
                    message: { bsonType: 'string' },
                    timestamp: { bsonType: 'date' }
                  }
                }
              }
            }
          }
        }
      },
      validationLevel: 'moderate'
    });

    // Create indexes for Bank Accounts
    await db.collection('bankAccounts').createIndexes([
      { key: { userId: 1 }, name: 'userId' },
      { key: { 'institution.id': 1 }, name: 'institutionId' },
      { key: { 'tellerData.accountId': 1 }, unique: true, sparse: true, name: 'unique_tellerId' },
      { key: { status: 1 }, name: 'status' },
      { key: { type: 1 }, name: 'accountType' },
      { key: { userId: 1, 'institution.id': 1 }, name: 'userId_institution' }
    ]);
  },

  async down(db) {
    // Remove validations
    await db.command({
      collMod: 'bankAccounts',
      validator: {},
      validationLevel: 'off'
    });
    
    // Drop indexes
    await db.collection('bankAccounts').dropIndexes();
  }
}; 