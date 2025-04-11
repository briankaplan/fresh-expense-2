module.exports = {
  async up(db) {
    // Create reports collection
    await db.createCollection('reports');

    // Reports Schema Validation
    await db.command({
      collMod: 'reports',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'type', 'dateRange', 'status'],
          properties: {
            userId: { bsonType: 'objectId' },
            companyId: { bsonType: 'objectId' },
            type: { enum: ['expense', 'category', 'merchant', 'subscription', 'tax'] },
            name: { bsonType: 'string' },
            description: { bsonType: 'string' },
            dateRange: {
              bsonType: 'object',
              required: ['startDate', 'endDate'],
              properties: {
                startDate: { bsonType: 'date' },
                endDate: { bsonType: 'date' },
                period: { enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] }
              }
            },
            filters: {
              bsonType: 'object',
              properties: {
                categories: { bsonType: 'array', items: { bsonType: 'objectId' } },
                merchants: { bsonType: 'array', items: { bsonType: 'objectId' } },
                tags: { bsonType: 'array', items: { bsonType: 'objectId' } },
                minAmount: { bsonType: 'double' },
                maxAmount: { bsonType: 'double' },
                currency: { bsonType: 'string' }
              }
            },
            format: { enum: ['pdf', 'csv', 'xlsx'] },
            schedule: {
              bsonType: 'object',
              properties: {
                frequency: { enum: ['daily', 'weekly', 'monthly'] },
                lastRun: { bsonType: 'date' },
                nextRun: { bsonType: 'date' },
                recipients: { bsonType: 'array', items: { bsonType: 'string' } }
              }
            },
            status: { enum: ['pending', 'processing', 'completed', 'failed'] },
            fileUrl: { bsonType: 'string' },
            summary: {
              bsonType: 'object',
              properties: {
                totalExpenses: { bsonType: 'double' },
                totalReceipts: { bsonType: 'int' },
                categoryBreakdown: {
                  bsonType: 'array',
                  items: {
                    bsonType: 'object',
                    properties: {
                      categoryId: { bsonType: 'objectId' },
                      amount: { bsonType: 'double' },
                      count: { bsonType: 'int' }
                    }
                  }
                },
                merchantBreakdown: {
                  bsonType: 'array',
                  items: {
                    bsonType: 'object',
                    properties: {
                      merchantId: { bsonType: 'objectId' },
                      amount: { bsonType: 'double' },
                      count: { bsonType: 'int' }
                    }
                  }
                }
              }
            },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
          }
        }
      }
    });

    // Create indexes for reports
    await db.collection('reports').createIndexes([
      { key: { userId: 1 } },
      { key: { companyId: 1 } },
      { key: { type: 1 } },
      { key: { status: 1 } },
      { key: { 'dateRange.startDate': 1 } },
      { key: { 'dateRange.endDate': 1 } }
    ]);

    // Update expenses schema to ensure all required fields
    await db.command({
      collMod: 'expenses',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'amount', 'date', 'merchantId', 'categoryId', 'currency'],
          properties: {
            userId: { bsonType: 'objectId' },
            companyId: { bsonType: 'objectId' },
            amount: { bsonType: 'double' },
            date: { bsonType: 'date' },
            description: { bsonType: 'string' },
            merchantId: { bsonType: 'objectId' },
            categoryId: { bsonType: 'objectId' },
            tags: { 
              bsonType: 'array',
              items: { bsonType: 'objectId' }
            },
            currency: { bsonType: 'string', enum: ['USD'] }, // Enforcing USD only
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
                  items: { bsonType: 'double' }
                }
              }
            },
            metadata: {
              bsonType: 'object',
              properties: {
                originalAmount: { bsonType: 'double' },
                originalCurrency: { bsonType: 'string' },
                exchangeRate: { bsonType: 'double' },
                isRecurring: { bsonType: 'bool' },
                subscriptionId: { bsonType: 'objectId' }
              }
            },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
          }
        }
      }
    });

    // Additional indexes for expenses
    await db.collection('expenses').createIndexes([
      { key: { merchantId: 1 } },
      { key: { currency: 1 } },
      { key: { 'metadata.subscriptionId': 1 } }
    ]);

    // Update merchants schema to ensure proper category relationship
    await db.command({
      collMod: 'merchants',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'categoryId'],
          properties: {
            name: { bsonType: 'string' },
            displayName: { bsonType: 'string' },
            description: { bsonType: 'string' },
            categoryId: { bsonType: 'objectId' }, // Adding required categoryId
            logo: { bsonType: 'string' },
            website: { bsonType: 'string' },
            isVerified: { bsonType: 'bool' },
            aliases: {
              bsonType: 'array',
              items: { bsonType: 'string' }
            },
            metadata: {
              bsonType: 'object',
              properties: {
                type: { enum: ['online', 'physical', 'both'] },
                country: { bsonType: 'string' },
                currency: { bsonType: 'string' },
                tags: {
                  bsonType: 'array',
                  items: { bsonType: 'string' }
                }
              }
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
                    items: { bsonType: 'double' }
                  }
                }
              }
            },
            tellerMerchantId: { bsonType: 'string' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
          }
        }
      }
    });
  },

  async down(db) {
    await db.dropCollection('reports');
    
    // Revert schema changes
    await db.command({
      collMod: 'expenses',
      validator: {}
    });
    
    await db.command({
      collMod: 'merchants',
      validator: {}
    });
  }
}; 