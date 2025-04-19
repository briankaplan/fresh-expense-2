import chalk from "chalk";
import * as dotenv from "dotenv";
import { type Collection, type Db, type Document, MongoClient } from "mongodb";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/fresh-expense";

interface CollectionConfig {
  name: string;
  requiredIndexes: any[];
  validationRules: any;
}

const collections: CollectionConfig[] = [
  {
    name: "users",
    requiredIndexes: [{ email: 1 }, { googleId: 1 }],
    validationRules: {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["email", "firstName", "lastName"],
          properties: {
            email: {
              bsonType: "string",
              pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
            },
            password: { bsonType: "string" },
            firstName: { bsonType: "string" },
            lastName: { bsonType: "string" },
            picture: { bsonType: "string" },
            googleId: { bsonType: "string" },
            isVerified: { bsonType: "bool" },
            isActive: { bsonType: "bool" },
            role: { enum: ["admin", "user"] },
            lastLoginAt: { bsonType: "date" },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" },
          },
        },
      },
    },
  },
  {
    name: "transactions",
    requiredIndexes: [
      { userId: 1, date: -1, amount: -1 },
      { userId: 1, category: 1, date: -1 },
      { userId: 1, description: "text" },
    ],
    validationRules: {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: [
            "userId",
            "accountId",
            "date",
            "amount",
            "description",
            "type",
            "status",
            "isExpense",
          ],
          properties: {
            userId: { bsonType: "objectId" },
            accountId: { bsonType: "string" },
            date: { bsonType: "date" },
            amount: { bsonType: "number" },
            description: { bsonType: "string" },
            type: { enum: ["credit", "debit", "transfer"] },
            status: { enum: ["pending", "posted", "cancelled"] },
            category: { bsonType: "string" },
            isExpense: { bsonType: "bool" },
            company: { enum: ["Down Home", "Music City Rodeo", "Personal"] },
          },
        },
      },
    },
  },
  {
    name: "receipts",
    requiredIndexes: [{ userId: 1, date: -1 }, { merchant: "text" }, { expenseId: 1 }],
    validationRules: {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["expenseId", "userId", "urls", "source", "merchant", "amount", "date"],
          properties: {
            expenseId: { bsonType: "objectId" },
            userId: { bsonType: "objectId" },
            urls: {
              bsonType: "object",
              required: ["original"],
              properties: {
                original: { bsonType: "string" },
                converted: { bsonType: "string" },
                thumbnail: { bsonType: "string" },
              },
            },
            source: { enum: ["CSV", "EMAIL", "GOOGLE_PHOTOS", "MANUAL", "UPLOAD"] },
            merchant: { bsonType: "string" },
            amount: { bsonType: "number" },
            date: { bsonType: "date" },
            category: { bsonType: "string" },
          },
        },
      },
    },
  },
];

async function verifyCollection(db: Db, collectionName: string): Promise<Collection<Document>> {
  console.log(chalk.yellow(`Verifying collection ${collectionName}...`));
  const collections = await db.listCollections().toArray();
  const exists = collections.some((col) => col.name === collectionName);

  if (!exists) {
    console.log(chalk.red(`Collection ${collectionName} does not exist`));
    await db.createCollection(collectionName);
    console.log(chalk.green(`Created collection ${collectionName}`));
  } else {
    console.log(chalk.green(`Collection ${collectionName} exists`));
  }

  return db.collection(collectionName);
}

async function verifyIndexes(collection: Collection, requiredIndexes: any[]): Promise<void> {
  console.log(chalk.yellow("Verifying indexes..."));
  const existingIndexes = await collection.indexes();

  for (const required of requiredIndexes) {
    const found = existingIndexes.some((existing) => {
      return JSON.stringify(existing.key) === JSON.stringify(required);
    });

    if (!found) {
      console.log(chalk.red(`Missing index: ${JSON.stringify(required)}`));
      try {
        await collection.createIndex(required);
        console.log(chalk.green(`Created missing index: ${JSON.stringify(required)}`));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(chalk.red(`Failed to create index: ${errorMessage}`));
      }
    } else {
      console.log(chalk.green(`Index exists: ${JSON.stringify(required)}`));
    }
  }
}

async function verifyValidation(db: Db, collection: Collection<Document>, validationRules: any) {
  try {
    const command = {
      collMod: collection.collectionName,
      validator: validationRules.validator,
      validationLevel: validationRules.validationLevel || "strict",
      validationAction: validationRules.validationAction || "error",
    };

    console.log(`Verifying validation rules for collection: ${collection.collectionName}`);
    await db.command(command);
    console.log(`✓ Validation rules verified for ${collection.collectionName}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `Error verifying validation rules for ${collection.collectionName}:`,
      errorMessage,
    );
    throw new Error(`Validation rules verification failed: ${errorMessage}`);
  }
}

async function main() {
  console.log(chalk.blue("Starting database verification..."));
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log(chalk.green("Connected to MongoDB"));

    const db = client.db();

    for (const collectionConfig of collections) {
      // Verify collection exists and get reference
      const collection = await verifyCollection(db, collectionConfig.name);

      // Verify indexes
      await verifyIndexes(collection, collectionConfig.requiredIndexes);

      // Verify validation rules
      await verifyValidation(db, collection, collectionConfig.validationRules);

      console.log(
        chalk.green(`✓ Completed verification for collection: ${collectionConfig.name}\n`),
      );
    }

    console.log(chalk.blue("\nVerification complete"));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Error during verification: ${errorMessage}`));
    throw error; // Re-throw to ensure process exits with error
  } finally {
    await client.close();
    console.log(chalk.yellow("Database connection closed"));
  }
}

main().catch(console.error);
