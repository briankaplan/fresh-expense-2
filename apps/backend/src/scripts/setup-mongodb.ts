import { MongoDBService } from '../services/database/mongodb.service';
import { ConfigService } from '@nestjs/config';
import { IndexDirection } from 'mongodb';

interface IndexConfig {
  key: { [key: string]: IndexDirection };
  name: string;
  unique?: boolean;
}

async function setupMongoDB() {
  const configService = new ConfigService();
  const mongoDBService = new MongoDBService(configService);

  try {
    // Connect to MongoDB
    const isConnected = await mongoDBService.isConnected();
    if (!isConnected) {
      throw new Error('MongoDB connection failed');
    }
    console.log('✅ Connected to MongoDB');

    // Setup collections and indexes
    const collections: Record<string, { indexes: IndexConfig[] }> = {
      transactions: {
        indexes: [
          { key: { date: 1 }, name: 'date_idx' },
          { key: { amount: { value: 1, currency: "USD" } }, name: 'amount_idx' },
          { key: { category: 1 }, name: 'category_idx' },
          { key: { merchant: 1 }, name: 'merchant_idx' },
          { key: { userId: 1 }, name: 'user_idx' },
        ],
      },
      users: {
        indexes: [
          { key: { email: 1 }, name: 'email_idx', unique: true },
          { key: { createdAt: 1 }, name: 'created_at_idx' },
        ],
      },
      categories: {
        indexes: [
          { key: { name: 1 }, name: 'name_idx', unique: true },
          { key: { type: 1 }, name: 'type_idx' },
        ],
      },
      merchants: {
        indexes: [
          { key: { name: 1 }, name: 'name_idx' },
          { key: { category: 1 }, name: 'category_idx' },
        ],
      },
    };

    // Create collections and indexes
    for (const [collectionName, config] of Object.entries(collections)) {
      const collection = await mongoDBService.getCollection(collectionName);
      console.log(`✅ Created collection: ${collectionName}`);

      for (const index of config.indexes) {
        await collection.createIndex(index.key, { name: index.name, unique: index.unique });
        console.log(`✅ Created index: ${index.name} on ${collectionName}`);
      }
    }

    console.log('✅ MongoDB setup completed successfully');
  } catch (error) {
    console.error('❌ MongoDB setup failed:', error);
  } finally {
    await mongoDBService.close();
    console.log('✅ Connection closed');
  }
}

setupMongoDB();
