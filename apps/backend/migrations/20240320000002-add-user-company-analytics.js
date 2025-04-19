module.exports = {
  async up(db) {
    // Create collections if they don't exist
    await db.createCollection("users");
    await db.createCollection("companies");
    await db.createCollection("analytics");

    // User Schema Validation
    await db.command({
      collMod: "users",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["email", "password", "firstName", "lastName"],
          properties: {
            email: { bsonType: "string" },
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
    });

    // Company Schema Validation
    await db.command({
      collMod: "companies",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["name", "ownerId"],
          properties: {
            name: { bsonType: "string" },
            ownerId: { bsonType: "objectId" },
            description: { bsonType: "string" },
            isActive: { bsonType: "bool" },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" },
          },
        },
      },
    });

    // Analytics Schema Validation
    await db.command({
      collMod: "analytics",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["userId", "type", "data"],
          properties: {
            userId: { bsonType: "objectId" },
            type: { enum: ["login", "action", "error"] },
            data: { bsonType: "object" },
            createdAt: { bsonType: "date" },
          },
        },
      },
    });

    // Create indexes
    await db
      .collection("users")
      .createIndexes([
        { key: { email: 1 }, unique: true },
        { key: { googleId: 1 }, sparse: true },
        { key: { role: 1 } },
      ]);

    await db
      .collection("companies")
      .createIndexes([
        { key: { userId: 1, name: 1 }, unique: true },
        { key: { userId: 1, industry: 1 } },
        { key: { "location.coordinates": "2dsphere" } },
      ]);

    await db.collection("analytics").createIndexes([
      {
        key: { userId: 1, companyId: 1, startDate: 1, endDate: 1 },
        unique: true,
      },
      { key: { userId: 1, period: 1 } },
      { key: { companyId: 1, period: 1 } },
    ]);
  },

  async down(db) {
    await db.dropCollection("users");
    await db.dropCollection("companies");
    await db.dropCollection("analytics");
  },
};
