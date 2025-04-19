var __importDefault =
  (this && this.__importDefault) || ((mod) => (mod && mod.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const react_router_dom_1 = require("react-router-dom");
const AuthLayout = () => {
  return (
    <material_1.Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        bgcolor: "background.default",
      }}
    >
      <material_1.Container maxWidth="sm">
        <material_1.Paper
          elevation={3}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <react_router_dom_1.Outlet />
        </material_1.Paper>
      </material_1.Container>
    </material_1.Box>
  );
};
exports.default = AuthLayout;
//# sourceMappingURL=AuthLayout.js.map
