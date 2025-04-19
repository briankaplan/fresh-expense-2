import React from 'react';
interface SparklineProps {
    data: {
        value: number;
    }[];
    currentValue: number;
    previousValue: number;
    label: string;
    height?: number;
    width?: number | string;
}
export declare const SparklineChart: React.FC<SparklineProps>;
export {};
//# sourceMappingURL=SparklineChart.d.ts.map