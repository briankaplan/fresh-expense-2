module.exports = {
  async up(db) {
    // Transaction indexes
    await db.collection('transactions').createIndexes([
      { key: { userId: 1, date: -1 }, name: 'userId_date' },
      { key: { userId: 1, merchant: 1 }, name: 'userId_merchant' },
      { key: { userId: 1, category: 1 }, name: 'userId_category' },
      { key: { externalId: 1 }, unique: true, name: 'unique_externalId' },
      { key: { userId: 1, company: 1 }, name: 'userId_company' },
      { key: { userId: 1, isExpense: 1 }, name: 'userId_isExpense' },
      { key: { 'location.coordinates': '2dsphere' }, name: 'location_2dsphere' },
    ]);

    // Receipt indexes
    await db.collection('receipts').createIndexes([
      { key: { userId: 1, date: -1 }, name: 'userId_date' },
      { key: { userId: 1, merchant: 1 }, name: 'userId_merchant' },
      { key: { expenseId: 1 }, name: 'expenseId' },
      { key: { 'metadata.r2Keys.original': 1 }, unique: true, sparse: true, name: 'unique_r2Key' },
      { key: { 'ocr.text': 'text', merchant: 'text' }, name: 'text_search' },
    ]);

    // Merchant indexes
    await db.collection('merchants').createIndexes([
      { key: { name: 1 }, unique: true, name: 'unique_name' },
      { key: { aliases: 1 }, name: 'aliases' },
      { key: { category: 1 }, name: 'category' },
      { key: { tags: 1 }, name: 'tags' },
    ]);

    // Expense indexes
    await db.collection('expenses').createIndexes([
      { key: { userId: 1, transactionDate: -1 }, name: 'userId_date' },
      { key: { companyId: 1 }, name: 'companyId' },
      { key: { category: 1 }, name: 'category' },
      { key: { receiptStatus: 1 }, name: 'receiptStatus' },
    ]);
  },

  async down(db) {
    // Remove Transaction indexes
    await db.collection('transactions').dropIndexes();

    // Remove Receipt indexes
    await db.collection('receipts').dropIndexes();

    // Remove Merchant indexes
    await db.collection('merchants').dropIndexes();

    // Remove Expense indexes
    await db.collection('expenses').dropIndexes();
  }
}; 