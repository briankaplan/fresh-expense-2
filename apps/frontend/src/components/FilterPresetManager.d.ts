import type { ExpenseFilter } from "@/services/expense.service";
import type React from "react";
interface FilterPresetManagerProps {
  open: boolean;
  onClose: () => void;
  currentFilters: ExpenseFilter;
  onApplyPreset: (filters: ExpenseFilter) => void;
}
export declare function FilterPresetManager({
  open,
  onClose,
  currentFilters,
  onApplyPreset,
}: FilterPresetManagerProps): React.JSX.Element;
//# sourceMappingURL=FilterPresetManager.d.ts.map
