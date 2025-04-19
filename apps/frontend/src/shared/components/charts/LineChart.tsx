import { Box, useTheme } from "@mui/material";
import type React from "react";
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 300,
  showGrid = true,
  strokeWidth = 2,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />}
          <XAxis
            dataKey="name"
            stroke={theme.palette.text.secondary}
            style={{ fontSize: "0.875rem" }}
          />
          <YAxis stroke={theme.palette.text.secondary} style={{ fontSize: "0.875rem" }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke={theme.palette.primary.main}
            strokeWidth={strokeWidth}
            dot={{ fill: theme.palette.primary.main }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default LineChart;
