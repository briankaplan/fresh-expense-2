import { resolve } from "path";
import * as dotenv from "dotenv";
import { Collection, Db, MongoClient } from "mongodb";

// Load environment variables
const envPath = resolve(__dirname, "../../.env");
console.log("Loading environment from:", envPath);
dotenv.config({ path: envPath });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("❌ MONGODB_URI is not set in environment");
  process.exit(1);
}

console.log("Using MongoDB URI:", uri.replace(/\/\/[^@]+@/, "//<credentials>@"));

async function testMongoDB() {
  const client = new MongoClient(uri!, {
    connectTimeoutMS: 5000,
    socketTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
  });

  try {
    // Test connection
    console.log("Testing MongoDB connection...");
    await client.connect();
    console.log("✅ MongoDB connection successful");

    // Test database operations
    const db = client.db();
    console.log("✅ Database access successful");

    // Create test collection
    const testCollection = db.collection("test_collection");
    console.log("✅ Collection access successful");

    // Test insert
    const testDoc = {
      message: "Test document",
      timestamp: new Date(),
      status: "matched",
    };
    const insertResult = await testCollection.insertOne(testDoc);
    console.log("✅ Document insert successful:", insertResult.insertedId);

    // Test find
    const foundDoc = await testCollection.findOne({
      _id: insertResult.insertedId,
    });
    console.log("✅ Document find successful:", foundDoc);

    // Test update
    const updateResult = await testCollection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { status: "matched" } },
    );
    console.log("✅ Document update successful:", updateResult.modifiedCount);

    // Test delete
    const deleteResult = await testCollection.deleteOne({
      _id: insertResult.insertedId,
    });
    console.log("✅ Document delete successful:", deleteResult.deletedCount);

    // Test indexes
    await testCollection.createIndex({ timestamp: 1 });
    console.log("✅ Index creation successful");

    // Get index information
    const indexes = await testCollection.indexes();
    console.log("✅ Indexes:", indexes);
  } catch (error) {
    console.error("❌ MongoDB test failed:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("✅ Connection closed");
  }
}

// Run the test
testMongoDB().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
