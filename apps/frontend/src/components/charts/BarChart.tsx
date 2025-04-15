import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '@mui/material';

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

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 300,
  barSize = 20,
  showGrid = true,
}) => {
  const theme = useTheme();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
        )}
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: theme.palette.text.secondary }}
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary }} />
        <Tooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
          }}
          cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
        />
        <Bar
          dataKey="value"
          radius={[4, 4, 0, 0]}
          barSize={barSize}
          fill={theme.palette.primary.main}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};
