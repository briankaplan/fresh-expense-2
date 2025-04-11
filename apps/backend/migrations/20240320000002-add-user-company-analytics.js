module.exports = {
  async up(db) {
    // User Schema Validation
    await db.command({
      collMod: 'users',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: { bsonType: 'string' },
            password: { bsonType: 'string' },
            firstName: { bsonType: 'string' },
            lastName: { bsonType: 'string' },
            picture: { bsonType: 'string' },
            googleId: { bsonType: 'string' },
            isVerified: { bsonType: 'bool' },
            isActive: { bsonType: 'bool' },
            role: { enum: ['admin', 'user'] },
            lastLoginAt: { bsonType: 'date' },
            refreshTokens: { 
              bsonType: 'array',
              items: { bsonType: 'string' }
            },
            preferences: {
              bsonType: 'object',
              properties: {
                theme: { enum: ['light', 'dark'] },
                currency: { bsonType: 'string' },
                notifications: {
                  bsonType: 'object',
                  properties: {
                    email: { bsonType: 'bool' },
                    push: { bsonType: 'bool' }
                  }
                }
              }
            }
          }
        }
      },
      validationLevel: 'moderate'
    });

    // Company Schema Validation
    await db.command({
      collMod: 'companies',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'name'],
          properties: {
            userId: { bsonType: 'string' },
            name: { bsonType: 'string' },
            description: { bsonType: 'string' },
            industry: { bsonType: 'string' },
            location: {
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
            },
            contact: {
              bsonType: 'object',
              properties: {
                phone: { bsonType: 'string' },
                email: { bsonType: 'string' },
                website: { bsonType: 'string' }
              }
            },
            settings: {
              bsonType: 'object',
              required: ['currency', 'timezone', 'dateFormat'],
              properties: {
                currency: { bsonType: 'string' },
                timezone: { bsonType: 'string' },
                dateFormat: { bsonType: 'string' },
                fiscalYearStart: { bsonType: 'date' },
                fiscalYearEnd: { bsonType: 'date' }
              }
            },
            status: { enum: ['active', 'inactive', 'archived'] },
            integrations: {
              bsonType: 'object',
              properties: {
                teller: {
                  bsonType: 'object',
                  properties: {
                    enabled: { bsonType: 'bool' },
                    lastSync: { bsonType: 'date' },
                    syncStatus: { bsonType: 'string' }
                  }
                },
                email: {
                  bsonType: 'object',
                  properties: {
                    enabled: { bsonType: 'bool' },
                    lastSync: { bsonType: 'date' },
                    syncStatus: { bsonType: 'string' }
                  }
                },
                storage: {
                  bsonType: 'object',
                  properties: {
                    enabled: { bsonType: 'bool' },
                    lastSync: { bsonType: 'date' },
                    syncStatus: { bsonType: 'string' }
                  }
                }
              }
            }
          }
        }
      },
      validationLevel: 'moderate'
    });

    // Analytics Schema Validation
    await db.command({
      collMod: 'analytics',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'companyId', 'startDate', 'endDate', 'period', 'summary', 'spendingByCategory'],
          properties: {
            userId: { bsonType: 'string' },
            companyId: { bsonType: 'string' },
            startDate: { bsonType: 'date' },
            endDate: { bsonType: 'date' },
            period: { enum: ['daily', 'weekly', 'monthly', 'yearly'] },
            summary: {
              bsonType: 'object',
              required: ['totalSpent', 'averageTransaction', 'largestTransaction', 'smallestTransaction', 'transactionCount'],
              properties: {
                totalSpent: { bsonType: 'double' },
                averageTransaction: { bsonType: 'double' },
                largestTransaction: { bsonType: 'double' },
                smallestTransaction: { bsonType: 'double' },
                transactionCount: { bsonType: 'int' }
              }
            },
            spendingByCategory: {
              bsonType: 'array',
              items: {
                bsonType: 'object',
                required: ['category', 'amount', 'percentage', 'count'],
                properties: {
                  category: { bsonType: 'string' },
                  amount: { bsonType: 'double' },
                  percentage: { bsonType: 'double' },
                  count: { bsonType: 'int' }
                }
              }
            },
            topMerchants: {
              bsonType: 'array',
              items: {
                bsonType: 'object',
                required: ['merchant', 'amount', 'count'],
                properties: {
                  merchant: { bsonType: 'string' },
                  amount: { bsonType: 'double' },
                  count: { bsonType: 'int' }
                }
              }
            }
          }
        }
      },
      validationLevel: 'moderate'
    });

    // Create indexes
    await db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { googleId: 1 }, sparse: true },
      { key: { role: 1 } }
    ]);

    await db.collection('companies').createIndexes([
      { key: { userId: 1, name: 1 }, unique: true },
      { key: { userId: 1, industry: 1 } },
      { key: { 'location.coordinates': '2dsphere' } }
    ]);

    await db.collection('analytics').createIndexes([
      { key: { userId: 1, companyId: 1, startDate: 1, endDate: 1 }, unique: true },
      { key: { userId: 1, period: 1 } },
      { key: { companyId: 1, period: 1 } }
    ]);
  },

  async down(db) {
    // Remove validations
    const collections = ['users', 'companies', 'analytics'];
    for (const collection of collections) {
      await db.command({
        collMod: collection,
        validator: {},
        validationLevel: 'off'
      });
      // Drop indexes
      await db.collection(collection).dropIndexes();
    }
  }
}; 