var __importDefault =
  (this && this.__importDefault) || ((mod) => (mod && mod.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const recharts_1 = require("recharts");
const material_1 = require("@mui/material");
const LineChart = ({ data, height = 300, showGrid = true, strokeWidth = 2 }) => {
  const theme = (0, material_1.useTheme)();
  return (
    <material_1.Box sx={{ width: "100%", height }}>
      <recharts_1.ResponsiveContainer width="100%" height="100%">
        <recharts_1.LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {showGrid && (
            <recharts_1.CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          )}
          <recharts_1.XAxis
            dataKey="name"
            stroke={theme.palette.text.secondary}
            style={{ fontSize: "0.875rem" }}
          />
          <recharts_1.YAxis
            stroke={theme.palette.text.secondary}
            style={{ fontSize: "0.875rem" }}
          />
          <recharts_1.Tooltip />
          <recharts_1.Line
            type="monotone"
            dataKey="value"
            stroke={theme.palette.primary.main}
            strokeWidth={strokeWidth}
            dot={{ fill: theme.palette.primary.main }}
          />
        </recharts_1.LineChart>
      </recharts_1.ResponsiveContainer>
    </material_1.Box>
  );
};
exports.default = LineChart;
//# sourceMappingURL=LineChart.js.map
