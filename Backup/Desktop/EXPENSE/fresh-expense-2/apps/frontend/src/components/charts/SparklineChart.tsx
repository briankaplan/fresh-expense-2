import React from 'react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface SparklineProps {
  data: { value: number }[];
  currentValue: number;
  previousValue: number;
  label: string;
  height?: number;
  width?: number | string;
}

// Suppress TypeScript errors for Recharts components
const RLineChart = LineChart as unknown as React.ComponentType<any>;
const RLine = Line as unknown as React.ComponentType<any>;
const RResponsiveContainer = ResponsiveContainer as unknown as React.ComponentType<any>;

export const SparklineChart: React.FC<SparklineProps> = ({
  data,
  currentValue,
  previousValue,
  label,
  height = 60,
  width = '100%',
}) => {
  const theme = useTheme();
  const percentageChange = ((currentValue - previousValue) / previousValue) * 100;
  const isPositive = percentageChange >= 0;

  return (
    <Box sx={{ width, p: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="h6">
          ${currentValue.toLocaleString()}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: isPositive ? 'success.main' : 'error.main',
          }}
        >
          {isPositive ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
          <Typography variant="caption" sx={{ ml: 0.5 }}>
            {Math.abs(percentageChange).toFixed(1)}%
          </Typography>
        </Box>
      </Box>
      <Box sx={{ height }}>
        <RResponsiveContainer width="100%" height="100%">
          <RLineChart data={data}>
            <RLine
              type="monotone"
              dataKey="value"
              stroke={isPositive ? theme.palette.success.main : theme.palette.error.main}
              strokeWidth={2}
              dot={false}
            />
          </RLineChart>
        </RResponsiveContainer>
      </Box>
    </Box>
  );
}; 