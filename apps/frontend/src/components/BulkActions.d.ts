import type { Expense } from "@/services/expense.service";
import type React from "react";
interface BulkActionsProps {
  selectedExpenses: Expense[];
  onDelete: (expenseIds: string[]) => void;
  onEdit: (expenseIds: string[]) => void;
  onLabel: (expenseIds: string[], label: string) => void;
  onShare: (expenseIds: string[]) => void;
}
export declare function BulkActions({
  selectedExpenses,
  onDelete,
  onEdit,
  onLabel,
  onShare,
}: BulkActionsProps): React.JSX.Element;
//# sourceMappingURL=BulkActions.d.ts.map
