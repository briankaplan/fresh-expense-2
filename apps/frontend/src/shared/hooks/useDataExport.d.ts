export interface ExportOptions {
  format: "csv" | "pdf" | "xlsx";
  startDate?: Date;
  endDate?: Date;
  categories?: string[];
  merchants?: string[];
}
export declare const useDataExport: () => {
  loading: boolean;
  error: string | null;
  exportData: (options: ExportOptions) => Promise<void>;
};
//# sourceMappingURL=useDataExport.d.ts.map
