import React from 'react';
import { Expense } from '@/services/expense.service';
interface BulkActionsProps {
    selectedExpenses: Expense[];
    onDelete: (expenseIds: string[]) => void;
    onEdit: (expenseIds: string[]) => void;
    onLabel: (expenseIds: string[], label: string) => void;
    onShare: (expenseIds: string[]) => void;
}
export declare function BulkActions({ selectedExpenses, onDelete, onEdit, onLabel, onShare, }: BulkActionsProps): React.JSX.Element;
export {};
//# sourceMappingURL=BulkActions.d.ts.map