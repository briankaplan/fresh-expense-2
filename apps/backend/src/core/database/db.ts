import { type Db, MongoClient } from "mongodb";

let db: Db | null = null;

export async function connectToDb() {
  if (!db) {
    const client = await MongoClient.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/expense-tracker",
    );
    db = client.db();
  }
  return db;
}

export async function getDb(): Promise<Db> {
  if (!db) {
    db = await connectToDb();
  }
  return db;
}
