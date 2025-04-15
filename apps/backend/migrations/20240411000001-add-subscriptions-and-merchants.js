module.exports = {
  async up(db) {
    // Create collections if they don't exist
    await db.createCollection('subscriptions');
    await db.createCollection('merchants');

    // Subscriptions Schema Validation
    await db.command({
      collMod: 'subscriptions',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'name', 'amount', 'frequency', 'startDate'],
          properties: {
            userId: { bsonType: 'objectId' },
            name: { bsonType: 'string' },
            description: { bsonType: 'string' },
            amount: { bsonType: 'double' },
            currency: { bsonType: 'string' },
            frequency: { enum: ['daily', 'weekly', 'monthly', 'yearly'] },
            startDate: { bsonType: 'date' },
            endDate: { bsonType: 'date' },
            lastBillDate: { bsonType: 'date' },
            nextBillDate: { bsonType: 'date' },
            categoryId: { bsonType: 'objectId' },
            merchantId: { bsonType: 'objectId' },
            status: { enum: ['active', 'paused', 'cancelled'] },
            paymentMethod: { enum: ['card', 'bank_transfer', 'other'] },
            bankAccountId: { bsonType: 'string' },
            reminderDays: { bsonType: 'int' },
            autoTrack: { bsonType: 'bool' },
            notes: { bsonType: 'string' },
            metadata: {
              bsonType: 'object',
              properties: {
                website: { bsonType: 'string' },
                logo: { bsonType: 'string' },
                color: { bsonType: 'string' },
              },
            },
            billingHistory: {
              bsonType: 'array',
              items: {
                bsonType: 'object',
                properties: {
                  date: { bsonType: 'date' },
                  amount: { bsonType: 'double' },
                  status: { enum: ['paid', 'pending', 'failed'] },
                  transactionId: { bsonType: 'string' },
                },
              },
            },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' },
          },
        },
      },
    });

    // Merchants Schema Validation
    await db.command({
      collMod: 'merchants',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name'],
          properties: {
            name: { bsonType: 'string' },
            displayName: { bsonType: 'string' },
            description: { bsonType: 'string' },
            logo: { bsonType: 'string' },
            website: { bsonType: 'string' },
            category: { bsonType: 'string' },
            isVerified: { bsonType: 'bool' },
            aliases: {
              bsonType: 'array',
              items: { bsonType: 'string' },
            },
            metadata: {
              bsonType: 'object',
              properties: {
                type: { enum: ['online', 'physical', 'both'] },
                country: { bsonType: 'string' },
                currency: { bsonType: 'string' },
                tags: {
                  bsonType: 'array',
                  items: { bsonType: 'string' },
                },
              },
            },
            locations: {
              bsonType: 'array',
              items: {
                bsonType: 'object',
                properties: {
                  address: { bsonType: 'string' },
                  city: { bsonType: 'string' },
                  state: { bsonType: 'string' },
                  country: { bsonType: 'string' },
                  postalCode: { bsonType: 'string' },
                  coordinates: {
                    bsonType: 'array',
                    items: { bsonType: 'double' },
                  },
                },
              },
            },
            tellerMerchantId: { bsonType: 'string' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' },
          },
        },
      },
    });

    // Create indexes
    await db
      .collection('subscriptions')
      .createIndexes([
        { key: { userId: 1 } },
        { key: { merchantId: 1 } },
        { key: { status: 1 } },
        { key: { nextBillDate: 1 } },
        { key: { frequency: 1 } },
      ]);

    await db
      .collection('merchants')
      .createIndexes([
        { key: { name: 1 }, unique: true },
        { key: { category: 1 } },
        { key: { aliases: 1 } },
        { key: { tellerMerchantId: 1 } },
        { key: { 'locations.coordinates': '2dsphere' } },
      ]);

    // Insert some common merchants
    const defaultMerchants = [
      {
        name: 'Netflix',
        displayName: 'Netflix',
        description: 'Streaming service',
        category: 'Entertainment',
        isVerified: true,
        metadata: {
          type: 'online',
          country: 'US',
          currency: 'USD',
          tags: ['streaming', 'entertainment', 'subscription'],
        },
      },
      {
        name: 'Spotify',
        displayName: 'Spotify',
        description: 'Music streaming service',
        category: 'Entertainment',
        isVerified: true,
        metadata: {
          type: 'online',
          country: 'US',
          currency: 'USD',
          tags: ['streaming', 'music', 'subscription'],
        },
      },
      {
        name: 'Amazon',
        displayName: 'Amazon',
        description: 'Online marketplace',
        category: 'Shopping',
        isVerified: true,
        metadata: {
          type: 'online',
          country: 'US',
          currency: 'USD',
          tags: ['shopping', 'retail', 'subscription'],
        },
      },
    ].map(merchant => ({
      ...merchant,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await db.collection('merchants').insertMany(defaultMerchants);
  },

  async down(db) {
    await db.dropCollection('subscriptions');
    await db.dropCollection('merchants');
  },
};
