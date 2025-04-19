import React from 'react';
interface Expense {
    id: string;
    date: string;
    description: string;
    amount: number;
    category: string;
    merchant: string;
    status: string;
}
interface ExpensesListProps {
    initialExpenses?: Expense[];
    pageSize?: number;
}
export declare function ExpensesList({ initialExpenses, pageSize }: ExpensesListProps): React.JSX.Element;
export {};
//# sourceMappingURL=ExpensesList.d.ts.map