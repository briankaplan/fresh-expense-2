var __importDefault =
  (this && this.__importDefault) || ((mod) => (mod && mod.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
exports.PieChart = void 0;
const react_1 = __importDefault(require("react"));
const recharts_1 = require("recharts");
const material_1 = require("@mui/material");
// Suppress TypeScript errors for Recharts components
const RPieChart = recharts_1.PieChart;
const RPie = recharts_1.Pie;
const RCell = recharts_1.Cell;
const RTooltip = recharts_1.Tooltip;
const RLegend = recharts_1.Legend;
const RResponsiveContainer = recharts_1.ResponsiveContainer;
const PieChart = ({
  data,
  height = 300,
  innerRadius = 60,
  outerRadius = 80,
  showLegend = true,
}) => {
  const theme = (0, material_1.useTheme)();
  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <material_1.Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 1.5,
          }}
        >
          <material_1.Typography variant="subtitle2" color="text.primary">
            {data.name}
          </material_1.Typography>
          <material_1.Typography variant="body2" color="text.secondary">
            ${data.value.toLocaleString()}
          </material_1.Typography>
        </material_1.Box>
      );
    }
    return null;
  };
  const CustomLegend = ({ payload }) => {
    return (
      <material_1.Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 2,
          mt: 2,
        }}
      >
        {payload.map((entry, index) => (
          <material_1.Box
            key={entry.value}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <material_1.Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: entry.color,
              }}
            />
            <material_1.Typography variant="body2" color="text.secondary">
              {entry.value}
            </material_1.Typography>
          </material_1.Box>
        ))}
      </material_1.Box>
    );
  };
  return (
    <material_1.Box sx={{ width: "100%", height }}>
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
    </material_1.Box>
  );
};
exports.PieChart = PieChart;
//# sourceMappingURL=PieChart.js.map
