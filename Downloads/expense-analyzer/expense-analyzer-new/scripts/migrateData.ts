const { PrismaClient: OldPrisma } = require('../../expense-analyzer/node_modules/@prisma/client');
const { PrismaClient: NewPrisma } = require('@prisma/client');

const oldPrisma = new OldPrisma();
const newPrisma = new NewPrisma();

async function migrateData() {
  try {
    console.log('🚀 Starting data migration...');

    // First migrate users
    const users = await oldPrisma.user.findMany();
    console.log(`Found ${users.length} users to migrate`);
    
    let successCount = 0;
    for (const user of users) {
      try {
        await newPrisma.user.create({
          data: {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        });
        successCount++;
        process.stdout.write(`\rMigrated ${successCount}/${users.length} users`);
      } catch (e) {
        console.error(`\nFailed to migrate user ${user.id}:`, e);
      }
    }
    console.log('\n✅ User migration completed');

    // Then migrate transactions
    const transactions = await oldPrisma.transaction.findMany({
      include: {
        receipt: true
      }
    });
    console.log(`\nFound ${transactions.length} transactions to migrate`);
    
    successCount = 0;
    for (const transaction of transactions) {
      try {
        // Create the transaction
        await newPrisma.transaction.create({
          data: {
            id: transaction.id,
            userId: transaction.userId,
            transactionDate: transaction.transactionDate,
            postDate: transaction.postDate,
            amount: transaction.amount,
            merchant: transaction.merchant,
            description: transaction.description,
            category: transaction.category,
            type: transaction.type,
            hasReceipt: transaction.hasReceipt,
            comment: transaction.comment,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt
          }
        });

        // If there's a receipt, create it
        if (transaction.receipt) {
          await newPrisma.receipt.create({
            data: {
              id: transaction.receipt.id,
              userId: transaction.receipt.userId,
              transactionId: transaction.receipt.transactionId,
              url: transaction.receipt.url,
              ocrData: transaction.receipt.ocrData,
              uploadDate: transaction.receipt.uploadDate,
              createdAt: transaction.receipt.createdAt,
              updatedAt: transaction.receipt.updatedAt
            }
          });
        }
        successCount++;
        process.stdout.write(`\rMigrated ${successCount}/${transactions.length} transactions`);
      } catch (e) {
        console.error(`\nFailed to migrate transaction ${transaction.id}:`, e);
      }
    }

    console.log('\n✅ Data migration completed successfully');
  } catch (error) {
    console.error('❌ Migration error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
  } finally {
    await oldPrisma.$disconnect();
    await newPrisma.$disconnect();
  }
}

migrateData();