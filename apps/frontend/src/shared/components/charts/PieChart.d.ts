import React from 'react';
interface DataPoint {
    name: string;
    value: number;
    color?: string;
}
interface PieChartProps {
    data: DataPoint[];
    height?: number;
    innerRadius?: number;
    outerRadius?: number;
    showLegend?: boolean;
}
export declare const PieChart: React.FC<PieChartProps>;
export {};
//# sourceMappingURL=PieChart.d.ts.map