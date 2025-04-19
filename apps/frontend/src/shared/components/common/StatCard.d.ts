import React from 'react';
import { Icons } from '../icons';
interface StatCardProps {
    title: string;
    value: string | number;
    icon?: keyof typeof Icons;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: string;
}
export declare const StatCard: React.FC<StatCardProps>;
export {};
//# sourceMappingURL=StatCard.d.ts.map