import { MongoClient } from 'mongodb';

const uri = "mongodb://dev:n36cGzjxsZ47zAYh@localhost:27017/expense_db?authSource=expense_db";

async function run() {
  console.log('Attempting to connect to MongoDB...');
  const client = new MongoClient(uri, {
    connectTimeoutMS: 5000,
    socketTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
  });

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB!");
    
    // Test a simple operation
    const db = client.db();
    await db.command({ ping: 1 });
    console.log("✅ Database ping successful!");
    
  } catch (err) {
    console.error("❌ Connection failed:", err);
  } finally {
    await client.close();
    console.log("✅ Connection closed");
  }
}

run().catch(console.error); 