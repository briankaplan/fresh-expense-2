const __importDefault =
  (this && this.__importDefault) || ((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarChart = void 0;
const react_1 = __importDefault(require("react"));
const recharts_1 = require("recharts");
const material_1 = require("@mui/material");
const BarChart = ({ data, height = 300, barSize = 20, showGrid = true }) => {
  const theme = (0, material_1.useTheme)();
  return (
    <recharts_1.ResponsiveContainer width="100%" height={height}>
      <recharts_1.BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        {showGrid && (
          <recharts_1.CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={theme.palette.divider}
          />
        )}
        <recharts_1.XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: theme.palette.text.secondary }}
        />
        <recharts_1.YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: theme.palette.text.secondary }}
        />
        <recharts_1.Tooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
          }}
          cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
        />
        <recharts_1.Bar
          dataKey="value"
          radius={[4, 4, 0, 0]}
          barSize={barSize}
          fill={theme.palette.primary.main}
        />
      </recharts_1.BarChart>
    </recharts_1.ResponsiveContainer>
  );
};
exports.BarChart = BarChart;
//# sourceMappingURL=BarChart.js.map
