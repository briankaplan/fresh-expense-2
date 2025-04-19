import type { ExpenseFilter } from "./expense.service";
export interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  filters: ExpenseFilter;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}
declare class FilterPresetService {
  private static instance;
  private baseUrl;
  private constructor();
  static getInstance(): FilterPresetService;
  getPresets(): Promise<FilterPreset[]>;
  createPreset(preset: Omit<FilterPreset, "id" | "createdAt" | "updatedAt">): Promise<FilterPreset>;
  updatePreset(id: string, preset: Partial<FilterPreset>): Promise<FilterPreset>;
  deletePreset(id: string): Promise<void>;
  setDefaultPreset(id: string): Promise<void>;
}
export default FilterPresetService;
//# sourceMappingURL=filter-preset.service.d.ts.map
