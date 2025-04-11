db.auth(process.env.MONGO_INITDB_ROOT_USERNAME, process.env.MONGO_INITDB_ROOT_PASSWORD)

db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE)

// Create collections
db.createCollection('users')
db.createCollection('expenses')
db.createCollection('categories')
db.createCollection('merchants')
db.createCollection('analytics')
db.createCollection('receipts')
db.createCollection('reports')

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.expenses.createIndex({ userId: 1, date: -1 })
db.categories.createIndex({ userId: 1, name: 1 })
db.merchants.createIndex({ userId: 1, name: 1 })
db.analytics.createIndex({ userId: 1, period: 1, startDate: -1 })
db.receipts.createIndex({ userId: 1, date: -1 })
db.reports.createIndex({ userId: 1, createdAt: -1 }) 