import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme, Box, Typography } from '@mui/material';

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

// Suppress TypeScript errors for Recharts components
const RPieChart = RechartsPieChart as unknown as React.ComponentType<any>;
const RPie = Pie as unknown as React.ComponentType<any>;
const RCell = Cell as unknown as React.ComponentType<any>;
const RTooltip = Tooltip as unknown as React.ComponentType<any>;
const RLegend = Legend as unknown as React.ComponentType<any>;
const RResponsiveContainer = ResponsiveContainer as unknown as React.ComponentType<any>;

export const PieChart: React.FC<PieChartProps> = ({
  data,
  height = 300,
  innerRadius = 60,
  outerRadius = 80,
  showLegend = true,
}) => {
  const theme = useTheme();
  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 1.5,
          }}
        >
          <Typography variant="subtitle2" color="text.primary">
            {data.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ${data.value.toLocaleString()}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 2,
          mt: 2,
        }}
      >
        {payload.map((entry: any, index: number) => (
          <Box
            key={entry.value}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: entry.color,
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {entry.value}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', height }}>
      <RResponsiveContainer>
        <RPieChart>
          <RPie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <RCell
                key={entry.name}
                fill={entry.color || colors[index % colors.length]}
                strokeWidth={0}
              />
            ))}
          </RPie>
          <RTooltip content={<CustomTooltip />} />
          {showLegend && <RLegend content={<CustomLegend />} />}
        </RPieChart>
      </RResponsiveContainer>
    </Box>
  );
}; 