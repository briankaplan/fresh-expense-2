var __importDefault =
  (this && this.__importDefault) || ((mod) => (mod && mod.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardCard = void 0;
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const icons_1 = require("../icons");
const DashboardCard = ({
  title,
  subtitle,
  icon,
  children,
  action,
  minHeight = "auto",
  fullHeight = false,
  elevation = 1,
  variant = "elevation",
  sx,
  headerSx,
  contentSx,
  onClick,
  loading = false,
}) => {
  const theme = (0, material_1.useTheme)();
  const Icon = icon ? icons_1.Icons[icon] : null;
  return (
    <material_1.Card
      elevation={elevation}
      variant={variant}
      sx={{
        height: fullHeight ? "100%" : "auto",
        minHeight,
        display: "flex",
        flexDirection: "column",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: onClick ? "translateY(-4px)" : "none",
        },
        ...sx,
      }}
      onClick={onClick}
    >
      <material_1.CardHeader
        title={
          <material_1.Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {Icon && <Icon sx={{ color: "primary.main" }} />}
            <material_1.Typography variant="h6" component="div">
              {title}
            </material_1.Typography>
          </material_1.Box>
        }
        subheader={subtitle}
        action={action}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          ...headerSx,
        }}
      />
      <material_1.CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          ...contentSx,
        }}
      >
        {loading ? (
          <material_1.Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <material_1.Typography variant="body2" color="text.secondary">
              Loading...
            </material_1.Typography>
          </material_1.Box>
        ) : (
          children
        )}
      </material_1.CardContent>
    </material_1.Card>
  );
};
exports.DashboardCard = DashboardCard;
//# sourceMappingURL=DashboardCard.js.map
