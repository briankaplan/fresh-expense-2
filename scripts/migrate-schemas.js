Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
// Load environment variables from root .env
(0, dotenv_1.config)({ path: (0, path_1.join)(process.cwd(), "..", ".env") });
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/fresh-expense";
const DRY_RUN = process.env.DRY_RUN === "true";
const migrations = [
  {
    collection: "users",
    transform: (doc) => ({
      ...doc,
      backupId: doc._id.toString(),
      backupDate: new Date(),
      backupSource: "migration",
      backupVersion: "1.0.0",
      metadata: {
        ...doc.metadata,
        migrated: true,
        migrationDate: new Date(),
      },
    }),
    validate: (doc) => {
      return doc.email && doc.role;
    },
    validateSchema: (doc) => {
      return (
        typeof doc.email === "string" &&
        typeof doc.role === "string" &&
        (!doc.metadata || typeof doc.metadata === "object")
      );
    },
    backup: true,
  },
  {
    collection: "transactions",
    transform: (doc) => ({
      ...doc,
      backupId: doc._id.toString(),
      backupDate: new Date(),
      backupSource: "migration",
      backupVersion: "1.0.0",
      metadata: {
        ...doc.metadata,
        migrated: true,
        migrationDate: new Date(),
      },
    }),
    validate: (doc) => {
      return doc.amount && doc.date && doc.type;
    },
    validateSchema: (doc) => {
      return (
        typeof doc.amount === "number" &&
        doc.date instanceof Date &&
        typeof doc.type === "string" &&
        (!doc.metadata || typeof doc.metadata === "object")
      );
    },
    backup: true,
  },
  {
    collection: "expenses",
    transform: (doc) => ({
      ...doc,
      backupId: doc._id.toString(),
      backupDate: new Date(),
      backupSource: "migration",
      backupVersion: "1.0.0",
      metadata: {
        ...doc.metadata,
        migrated: true,
        migrationDate: new Date(),
      },
    }),
    validate: (doc) => {
      return doc.amount && doc.date;
    },
    validateSchema: (doc) => {
      return (
        typeof doc.amount === "number" &&
        doc.date instanceof Date &&
        (!doc.metadata || typeof doc.metadata === "object")
      );
    },
    backup: true,
  },
  {
    collection: "receipts",
    transform: (doc) => ({
      ...doc,
      backupId: doc._id.toString(),
      backupDate: new Date(),
      backupSource: "migration",
      backupVersion: "1.0.0",
      metadata: {
        ...doc.metadata,
        migrated: true,
        migrationDate: new Date(),
      },
    }),
    validate: (doc) => {
      return doc.fileUrl && doc.userId;
    },
    validateSchema: (doc) => {
      return (
        typeof doc.fileUrl === "string" &&
        typeof doc.userId === "string" &&
        (!doc.metadata || typeof doc.metadata === "object")
      );
    },
    backup: true,
  },
  {
    collection: "merchants",
    transform: (doc) => ({
      ...doc,
      backupId: doc._id.toString(),
      backupDate: new Date(),
      backupSource: "migration",
      backupVersion: "1.0.0",
      metadata: {
        ...doc.metadata,
        migrated: true,
        migrationDate: new Date(),
      },
    }),
    validate: (doc) => {
      return doc.name && doc.type;
    },
    validateSchema: (doc) => {
      return (
        typeof doc.name === "string" &&
        typeof doc.type === "string" &&
        (!doc.metadata || typeof doc.metadata === "object")
      );
    },
    backup: true,
  },
  {
    collection: "subscriptions",
    transform: (doc) => ({
      ...doc,
      backupId: doc._id.toString(),
      backupDate: new Date(),
      backupSource: "migration",
      backupVersion: "1.0.0",
      metadata: {
        ...doc.metadata,
        migrated: true,
        migrationDate: new Date(),
      },
    }),
    validate: (doc) => {
      return doc.name && doc.amount && doc.billingCycle;
    },
    validateSchema: (doc) => {
      return (
        typeof doc.name === "string" &&
        typeof doc.amount === "number" &&
        typeof doc.billingCycle === "string" &&
        (!doc.metadata || typeof doc.metadata === "object")
      );
    },
    backup: true,
  },
  {
    collection: "reports",
    transform: (doc) => ({
      ...doc,
      backupId: doc._id.toString(),
      backupDate: new Date(),
      backupSource: "migration",
      backupVersion: "1.0.0",
      metadata: {
        ...doc.metadata,
        migrated: true,
        migrationDate: new Date(),
      },
    }),
    validate: (doc) => {
      return doc.userId && doc.type;
    },
    validateSchema: (doc) => {
      return (
        typeof doc.userId === "string" &&
        typeof doc.type === "string" &&
        (!doc.metadata || typeof doc.metadata === "object")
      );
    },
    backup: true,
  },
  {
    collection: "budgets",
    transform: (doc) => ({
      ...doc,
      backupId: doc._id.toString(),
      backupDate: new Date(),
      backupSource: "migration",
      backupVersion: "1.0.0",
      metadata: {
        ...doc.metadata,
        migrated: true,
        migrationDate: new Date(),
      },
    }),
    validate: (doc) => {
      return doc.name && doc.amount && doc.period && doc.userId;
    },
    validateSchema: (doc) => {
      return (
        typeof doc.name === "string" &&
        typeof doc.amount === "number" &&
        typeof doc.period === "string" &&
        typeof doc.userId === "string" &&
        (!doc.metadata || typeof doc.metadata === "object") &&
        (!doc.alerts || Array.isArray(doc.alerts)) &&
        (!doc.categoryIds || Array.isArray(doc.categoryIds)) &&
        (!doc.tagIds || Array.isArray(doc.tagIds))
      );
    },
    backup: true,
  },
  {
    collection: "ocr_results",
    transform: (doc) => ({
      ...doc,
      backupId: doc._id.toString(),
      backupDate: new Date(),
      backupSource: "migration",
      backupVersion: "1.0.0",
      metadata: {
        ...doc.metadata,
        migrated: true,
        migrationDate: new Date(),
      },
    }),
    validate: (doc) => {
      return doc.userId && doc.receiptId && doc.status;
    },
    validateSchema: (doc) => {
      return (
        typeof doc.userId === "string" &&
        typeof doc.receiptId === "string" &&
        typeof doc.status === "string" &&
        (!doc.metadata || typeof doc.metadata === "object") &&
        (!doc.textBlocks || Array.isArray(doc.textBlocks)) &&
        (!doc.extractedData || typeof doc.extractedData === "object")
      );
    },
    backup: true,
  },
  {
    collection: "ai_models",
    transform: (doc) => ({
      ...doc,
      backupId: doc._id.toString(),
      backupDate: new Date(),
      backupSource: "migration",
      backupVersion: "1.0.0",
      metadata: {
        ...doc.metadata,
        migrated: true,
        migrationDate: new Date(),
      },
    }),
    validate: (doc) => {
      return doc.name && doc.type && doc.status && doc.version;
    },
    validateSchema: (doc) => {
      return (
        typeof doc.name === "string" &&
        typeof doc.type === "string" &&
        typeof doc.status === "string" &&
        typeof doc.version === "string" &&
        (!doc.metrics || typeof doc.metrics === "object") &&
        (!doc.configuration || typeof doc.configuration === "object") &&
        (!doc.trainingData || Array.isArray(doc.trainingData))
      );
    },
    backup: true,
  },
  {
    collection: "search_index",
    transform: (doc) => ({
      ...doc,
      backupId: doc._id.toString(),
      backupDate: new Date(),
      backupSource: "migration",
      backupVersion: "1.0.0",
      metadata: {
        ...doc.metadata,
        migrated: true,
        migrationDate: new Date(),
      },
    }),
    validate: (doc) => {
      return doc.userId && doc.type && doc.content;
    },
    validateSchema: (doc) => {
      return (
        typeof doc.userId === "string" &&
        typeof doc.type === "string" &&
        typeof doc.content === "string" &&
        (!doc.metadata || typeof doc.metadata === "object") &&
        (!doc.embeddings || Array.isArray(doc.embeddings)) &&
        (!doc.matches || Array.isArray(doc.matches))
      );
    },
    backup: true,
  },
  {
    collection: "analytics",
    transform: (doc) => ({
      ...doc,
      backupId: doc._id.toString(),
      backupDate: new Date(),
      backupSource: "migration",
      backupVersion: "1.0.0",
      metadata: {
        ...doc.metadata,
        migrated: true,
        migrationDate: new Date(),
      },
    }),
    validate: (doc) => {
      return doc.userId && doc.type && doc.period && doc.startDate && doc.endDate;
    },
    validateSchema: (doc) => {
      return (
        typeof doc.userId === "string" &&
        typeof doc.type === "string" &&
        typeof doc.period === "string" &&
        doc.startDate instanceof Date &&
        doc.endDate instanceof Date &&
        (!doc.metadata || typeof doc.metadata === "object") &&
        (!doc.userBehavior || typeof doc.userBehavior === "object") &&
        (!doc.spending || typeof doc.spending === "object") &&
        (!doc.merchantInsights || typeof doc.merchantInsights === "object") &&
        (!doc.categoryAnalysis || typeof doc.categoryAnalysis === "object") &&
        (!doc.budgetPerformance || typeof doc.budgetPerformance === "object") &&
        (!doc.systemMetrics || typeof doc.systemMetrics === "object")
      );
    },
    backup: true,
  },
  {
    collection: "categories",
    transform: (doc) => ({
      ...doc,
      backupId: doc._id.toString(),
      backupDate: new Date(),
      backupSource: "migration",
      backupVersion: "1.0.0",
      metadata: {
        ...doc.metadata,
        migrated: true,
        migrationDate: new Date(),
      },
    }),
    validate: (doc) => {
      return doc.userId && doc.name && doc.type;
    },
    validateSchema: (doc) => {
      return (
        typeof doc.userId === "string" &&
        typeof doc.name === "string" &&
        typeof doc.type === "string" &&
        (!doc.metadata || typeof doc.metadata === "object") &&
        (!doc.rules || Array.isArray(doc.rules)) &&
        (!doc.childrenIds || Array.isArray(doc.childrenIds)) &&
        (!doc.tags || Array.isArray(doc.tags)) &&
        (!doc.statistics || typeof doc.statistics === "object")
      );
    },
    backup: true,
  },
  {
    collection: "settings",
    transform: (doc) => ({
      ...doc,
      backupId: doc._id.toString(),
      backupDate: new Date(),
      backupSource: "migration",
      backupVersion: "1.0.0",
      metadata: {
        ...doc.metadata,
        migrated: true,
        migrationDate: new Date(),
      },
    }),
    validate: (doc) => {
      return doc.userId && doc.currency && doc.dateFormat && doc.timeZone;
    },
    validateSchema: (doc) => {
      return (
        typeof doc.userId === "string" &&
        typeof doc.currency === "string" &&
        typeof doc.dateFormat === "string" &&
        typeof doc.timeZone === "string" &&
        (!doc.notifications || typeof doc.notifications === "object") &&
        (!doc.budget || typeof doc.budget === "object") &&
        (!doc.export || typeof doc.export === "object") &&
        (!doc.security || typeof doc.security === "object") &&
        (!doc.preferences || typeof doc.preferences === "object") &&
        (!doc.integrations || typeof doc.integrations === "object") &&
        (!doc.backup || typeof doc.backup === "object") &&
        (!doc.metadata || typeof doc.metadata === "object")
      );
    },
    backup: true,
  },
  {
    collection: "integrations",
    transform: (doc) => ({
      ...doc,
      backupId: doc._id.toString(),
      backupDate: new Date(),
      backupSource: "migration",
      backupVersion: "1.0.0",
      metadata: {
        ...doc.metadata,
        migrated: true,
        migrationDate: new Date(),
      },
    }),
    validate: (doc) => {
      return doc.userId && doc.name && doc.type && doc.provider && doc.credentials;
    },
    validateSchema: (doc) => {
      return (
        typeof doc.userId === "string" &&
        typeof doc.name === "string" &&
        typeof doc.type === "string" &&
        typeof doc.provider === "string" &&
        typeof doc.credentials === "object" &&
        (!doc.sync || typeof doc.sync === "object") &&
        (!doc.mappings || Array.isArray(doc.mappings)) &&
        (!doc.webhook || typeof doc.webhook === "object") &&
        (!doc.config || typeof doc.config === "object") &&
        (!doc.metadata || typeof doc.metadata === "object") &&
        (!doc.stats || typeof doc.stats === "object") &&
        (!doc.tags || Array.isArray(doc.tags))
      );
    },
    backup: true,
  },
  {
    collection: "sendgrid_emails",
    transform: (doc) => ({
      ...doc,
      backupId: doc._id.toString(),
      backupDate: new Date(),
      backupSource: "migration",
      backupVersion: "1.0.0",
      metadata: {
        ...doc.metadata,
        migrated: true,
        migrationDate: new Date(),
      },
    }),
    validate: (doc) => {
      return doc.userId && doc.status && doc.metadata;
    },
    validateSchema: (doc) => {
      return (
        typeof doc.userId === "string" &&
        typeof doc.status === "string" &&
        typeof doc.metadata === "object" &&
        (!doc.attachments || Array.isArray(doc.attachments)) &&
        (!doc.html || typeof doc.html === "string") &&
        (!doc.text || typeof doc.text === "string") &&
        (!doc.receiptId || typeof doc.receiptId === "string") &&
        (!doc.processing || typeof doc.processing === "object") &&
        (!doc.validation || typeof doc.validation === "object") &&
        (!doc.enrichment || typeof doc.enrichment === "object") &&
        (!doc.stats || typeof doc.stats === "object") &&
        (!doc.tags || Array.isArray(doc.tags))
      );
    },
    backup: true,
  },
  {
    collection: "sms_messages",
    transform: (doc) => ({
      ...doc,
      backupId: doc._id.toString(),
      backupDate: new Date(),
      backupSource: "migration",
      backupVersion: "1.0.0",
      metadata: {
        ...doc.metadata,
        migrated: true,
        migrationDate: new Date(),
      },
    }),
    validate: (doc) => {
      return doc.userId && doc.status && doc.metadata;
    },
    validateSchema: (doc) => {
      return (
        typeof doc.userId === "string" &&
        typeof doc.status === "string" &&
        typeof doc.metadata === "object" &&
        (!doc.text || typeof doc.text === "string") &&
        (!doc.media || Array.isArray(doc.media)) &&
        (!doc.receiptId || typeof doc.receiptId === "string") &&
        (!doc.processing || typeof doc.processing === "object") &&
        (!doc.validation || typeof doc.validation === "object") &&
        (!doc.enrichment || typeof doc.enrichment === "object") &&
        (!doc.stats || typeof doc.stats === "object") &&
        (!doc.tags || Array.isArray(doc.tags))
      );
    },
    backup: true,
  },
];
async function migrate() {
  const client = new mongodb_1.MongoClient(MONGODB_URI);
  try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    const db = client.db();
    if (DRY_RUN) {
      console.log("Running in DRY RUN mode - no changes will be made");
    }
    // Check if database exists and has collections
    const collections = await db.listCollections().toArray();
    if (collections.length === 0) {
      console.log("No collections found in database. Creating collections...");
    } else {
      console.log(`Found ${collections.length} collections in database`);
    }
    for (const migration of migrations) {
      console.log(`\nProcessing ${migration.collection}...`);
      const collection = db.collection(migration.collection);
      const count = await collection.countDocuments();
      if (count === 0) {
        console.log(`No documents found in ${migration.collection}.`);
        if (!DRY_RUN) {
          // Create collection with schema validation
          await db.createCollection(migration.collection, {
            validator: {
              $jsonSchema: {
                bsonType: "object",
                required: Object.keys(migration.validateSchema({})),
                properties: {
                  _id: { bsonType: "objectId" },
                  backupId: { bsonType: "string" },
                  backupDate: { bsonType: "date" },
                  backupSource: { bsonType: "string" },
                  backupVersion: { bsonType: "string" },
                  metadata: {
                    bsonType: "object",
                    properties: {
                      migrated: { bsonType: "bool" },
                      migrationDate: { bsonType: "date" },
                    },
                  },
                },
              },
            },
          });
          console.log(`Created collection ${migration.collection} with schema validation`);
        }
        continue;
      }
      console.log(`Found ${count} documents to migrate`);
      const cursor = collection.find({});
      let processed = 0;
      let errors = 0;
      const skipped = 0;
      let schemaErrors = 0;
      while (await cursor.hasNext()) {
        const doc = await cursor.next();
        if (!doc) continue;
        try {
          if (!migration.validate(doc)) {
            console.error(`Invalid document in ${migration.collection}:`, doc._id);
            errors++;
            continue;
          }
          if (!migration.validateSchema(doc)) {
            console.error(`Schema validation failed for document ${doc._id}`);
            schemaErrors++;
            continue;
          }
          if (DRY_RUN) {
            const transformed = migration.transform(doc);
            console.log(`Would update document ${doc._id}:`, transformed);
            processed++;
            continue;
          }
          // Create backup if needed
          if (migration.backup) {
            const backupCollection = db.collection(`${migration.collection}_backup`);
            await backupCollection.insertOne({
              ...doc,
              backupDate: new Date(),
              backupSource: "migration",
              backupVersion: "1.0.0",
            });
          }
          const transformed = migration.transform(doc);
          await collection.updateOne({ _id: doc._id }, { $set: transformed });
          processed++;
          if (processed % 100 === 0) {
            console.log(`Processed ${processed}/${count} documents in ${migration.collection}`);
          }
        } catch (error) {
          console.error(`Error migrating document ${doc._id}:`, error);
          errors++;
        }
      }
      console.log(`\nMigration summary for ${migration.collection}:`);
      console.log(`- Processed: ${processed}`);
      console.log(`- Errors: ${errors}`);
      console.log(`- Schema Errors: ${schemaErrors}`);
      console.log(`- Skipped: ${skipped}`);
    }
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\nMigration complete");
  }
}
migrate().catch(console.error);
//# sourceMappingURL=migrate-schemas.js.map
