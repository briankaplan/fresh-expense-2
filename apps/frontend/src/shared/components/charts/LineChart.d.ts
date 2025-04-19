import React from 'react';
interface LineChartProps {
    data: Array<{
        name: string;
        value: number;
        [key: string]: any;
    }>;
    height?: number;
    showGrid?: boolean;
    strokeWidth?: number;
}
declare const LineChart: React.FC<LineChartProps>;
export default LineChart;
//# sourceMappingURL=LineChart.d.ts.map