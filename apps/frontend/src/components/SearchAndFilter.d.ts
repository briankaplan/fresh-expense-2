import type React from "react";
export interface FilterOption {
  label: string;
  value: string;
  type: "text" | "number" | "date" | "select";
  options?: {
    label: string;
    value: string;
  }[];
}
interface SearchAndFilterProps {
  onSearch: (value: string) => void;
  onFilter: (filters: Record<string, any>) => void;
  filterOptions: FilterOption[];
  placeholder?: string;
}
export declare function SearchAndFilter({
  onSearch,
  onFilter,
  filterOptions,
  placeholder,
}: SearchAndFilterProps): React.JSX.Element;
//# sourceMappingURL=SearchAndFilter.d.ts.map
