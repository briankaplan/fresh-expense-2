"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparklineChart = void 0;
const react_1 = __importDefault(require("react"));
const recharts_1 = require("recharts");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
// Suppress TypeScript errors for Recharts components
const RLineChart = recharts_1.LineChart;
const RLine = recharts_1.Line;
const RResponsiveContainer = recharts_1.ResponsiveContainer;
const SparklineChart = ({ data, currentValue, previousValue, label, height = 60, width = '100%', }) => {
    const theme = (0, material_1.useTheme)();
    const percentageChange = ((currentValue - previousValue) / previousValue) * 100;
    const isPositive = percentageChange >= 0;
    return (<material_1.Box sx={{ width, p: 2 }}>
      <material_1.Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {label}
      </material_1.Typography>
      <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <material_1.Typography variant="h6">${currentValue.toLocaleString()}</material_1.Typography>
        <material_1.Box sx={{
            display: 'flex',
            alignItems: 'center',
            color: isPositive ? 'success.main' : 'error.main',
        }}>
          {isPositive ? <icons_material_1.TrendingUp fontSize="small"/> : <icons_material_1.TrendingDown fontSize="small"/>}
          <material_1.Typography variant="caption" sx={{ ml: 0.5 }}>
            {Math.abs(percentageChange).toFixed(1)}%
          </material_1.Typography>
        </material_1.Box>
      </material_1.Box>
      <material_1.Box sx={{ height }}>
        <RResponsiveContainer width="100%" height="100%">
          <RLineChart data={data}>
            <RLine type="monotone" dataKey="value" stroke={isPositive ? theme.palette.success.main : theme.palette.error.main} strokeWidth={2} dot={false}/>
          </RLineChart>
        </RResponsiveContainer>
      </material_1.Box>
    </material_1.Box>);
};
exports.SparklineChart = SparklineChart;
//# sourceMappingURL=SparklineChart.js.map