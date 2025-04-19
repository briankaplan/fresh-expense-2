import { resolve } from 'path';

import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

import { MongoDBService } from '../services/database/mongodb.service';


// Load environment variables from the correct path
const envPath = resolve(__dirname, '../../.env');
console.log('Loading environment from:', envPath);
dotenv.config({ path: envPath });

// Log the MongoDB URI (with credentials hidden)
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ MONGODB_URI is not set in environment');
  process.exit(1);
}
console.log('MongoDB URI:', mongoUri.replace(/\/\/[^@]+@/, '//<credentials>@'));

async function testMongoDB() {
  const configService = new ConfigService({
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB: process.env.MONGODB_DB,
  });

  const mongoDBService = new MongoDBService(configService);

  try {
    // Test connection
    console.log('Testing MongoDB connection...');
    const isConnected = await mongoDBService.isConnected();
    if (!isConnected) {
      throw new Error('MongoDB connection failed');
    }
    console.log('✅ MongoDB connection successful');

    // Test database operations
    const db = await mongoDBService.getDb();
    console.log('✅ Database access successful');

    // Create test collection
    const testCollection = await mongoDBService.getCollection('test_collection');
    console.log('✅ Collection access successful');

    // Test insert
    const testDoc = {
      message: 'Test document',
      timestamp: new Date(),
      status: 'matched',
    };
    const insertResult = await testCollection.insertOne(testDoc);
    console.log('✅ Document insert successful:', insertResult.insertedId);

    // Test find
    const foundDoc = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log('✅ Document find successful:', foundDoc);

    // Test update
    const updateResult = await testCollection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { status: 'matched' } },
    );
    console.log('✅ Document update successful:', updateResult.modifiedCount);

    // Test delete
    const deleteResult = await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ Document delete successful:', deleteResult.deletedCount);

    // Test indexes
    await testCollection.createIndex({ timestamp: 1 });
    console.log('✅ Index creation successful');

    // Get index information
    const indexes = await testCollection.indexes();
    console.log('✅ Indexes:', indexes);
  } catch (error) {
    console.error('❌ MongoDB test failed:', error);
    process.exit(1);
  } finally {
    await mongoDBService.close();
    console.log('✅ Connection closed');
  }
}

// Add error handling for the main promise
testMongoDB().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
