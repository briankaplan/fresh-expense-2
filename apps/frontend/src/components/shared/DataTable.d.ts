interface Column<T> {
    id: keyof T;
    label: string;
    minWidth?: number;
    align?: 'left' | 'right' | 'center';
    format?: (value: any) => string;
}
interface DataTableProps<T extends Record<string, unknown>> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    defaultSortBy?: keyof T;
    defaultSortOrder?: 'asc' | 'desc';
    rowsPerPageOptions?: number[];
    onRowClick?: (row: T) => void;
    searchable?: boolean;
    searchPlaceholder?: string;
}
export declare function DataTable<T extends Record<string, unknown>>({ columns, data, loading, defaultSortBy, defaultSortOrder, rowsPerPageOptions, onRowClick, searchable, searchPlaceholder, }: DataTableProps<T>): import("react").JSX.Element;
export {};
//# sourceMappingURL=DataTable.d.ts.map