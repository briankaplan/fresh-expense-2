import type React from "react";
import type { Icons } from "../icons";
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
//# sourceMappingURL=StatCard.d.ts.map
