import React from 'react';
import { ExpenseFilter } from '@/services/expense.service';
interface FilterPresetManagerProps {
    open: boolean;
    onClose: () => void;
    currentFilters: ExpenseFilter;
    onApplyPreset: (filters: ExpenseFilter) => void;
}
export declare function FilterPresetManager({ open, onClose, currentFilters, onApplyPreset, }: FilterPresetManagerProps): React.JSX.Element;
export {};
//# sourceMappingURL=FilterPresetManager.d.ts.map