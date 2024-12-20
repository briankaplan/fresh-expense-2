import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleTransactions = [
  {
    date: new Date('2024-03-19'),
    description: 'Coffee Shop',
    amount: 4.50,
    type: 'debit',
    category: 'food',
  },
  {
    date: new Date('2024-03-18'),
    description: 'Uber Ride',
    amount: 25.99,
    type: 'debit',
    category: 'transportation',
  },
  {
    date: new Date('2024-03-17'),
    description: 'Amazon.com',
    amount: 67.99,
    type: 'debit',
    category: 'shopping',
  },
] as const;

const sampleExpenses = [
  {
    date: new Date('2024-03-19'),
    merchant: 'Starbucks',
    amount: 4.50,
    category: 'food',
    source: 'expensify',
  },
  {
    date: new Date('2024-03-18'),
    merchant: 'Uber',
    amount: 25.99,
    category: 'transportation',
    source: 'expensify',
  },
  {
    date: new Date('2024-03-17'),
    merchant: 'Amazon',
    amount: 67.99,
    category: 'shopping',
    source: 'manual',
  },
] as const;

async function main() {
  try {
    // Clear existing data
    await prisma.match.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.receipt.deleteMany();

    // Create sample transactions
    const transactions = await Promise.all(
      sampleTransactions.map(tx => 
        prisma.transaction.create({
          data: tx,
        })
      )
    );

    // Create sample expenses
    const expenses = await Promise.all(
      sampleExpenses.map(exp =>
        prisma.expense.create({
          data: exp,
        })
      )
    );

    // Create sample receipt
    const receipt = await prisma.receipt.create({
      data: {
        url: 'https://example.com/receipt.jpg',
        date: new Date('2024-03-19'),
        merchant: 'Starbucks',
        total: 4.50,
        tax: 0.45,
        category: 'food',
        items: {
          items: [
            {
              description: 'Grande Latte',
              quantity: 1,
              unitPrice: 4.05,
              totalAmount: 4.05,
            },
          ],
        },
      },
    });

    // Create sample matches
    const matches = await Promise.all([
      prisma.match.create({
        data: {
          transactionId: transactions[0].id,
          expenseId: expenses[0].id,
          confidence: 0.95,
          status: 'confirmed',
        },
      }),
      prisma.match.create({
        data: {
          transactionId: transactions[1].id,
          expenseId: expenses[1].id,
          confidence: 0.88,
          status: 'pending',
        },
      }),
    ]);

    console.log('✅ Database seeded successfully');
    console.log({
      transactions: transactions.length,
      expenses: expenses.length,
      receipts: 1,
      matches: matches.length,
    });
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });