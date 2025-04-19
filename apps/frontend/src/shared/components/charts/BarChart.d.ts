import React from 'react';
interface DataPoint {
    name: string;
    value: number;
    color?: string;
}
interface BarChartProps {
    data: DataPoint[];
    height?: number;
    barSize?: number;
    showGrid?: boolean;
}
export declare const BarChart: React.FC<BarChartProps>;
export {};
//# sourceMappingURL=BarChart.d.ts.map