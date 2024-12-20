import { prisma } from '@/lib/prisma';
import { ExpenseAnalyzer } from '@/components/ExpenseAnalyzer';
import { Suspense } from 'react';

export default async function Home() {
  // Fetch data on the server
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
  });

  const expenses = await prisma.expense.findMany({
    orderBy: { date: 'desc' },
  });

  // Pass data to client component with suspense boundary
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExpenseAnalyzer initialTransactions={transactions} initialExpenses={expenses} />
    </Suspense>
  );
}
