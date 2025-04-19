"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardLayout = void 0;
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const MainLayout_1 = require("./MainLayout");
const DashboardLayout = ({ children, title, subtitle, actions, }) => {
    const theme = (0, material_1.useTheme)();
    return (<MainLayout_1.MainLayout>
      <material_1.Container maxWidth="xl" sx={{ py: 4 }}>
        <material_1.Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
        }}>
          <material_1.Box>
            {title && (<Typography variant="h4" component="h1" gutterBottom>
                {title}
              </Typography>)}
            {subtitle && (<Typography variant="subtitle1" color="text.secondary">
                {subtitle}
              </Typography>)}
          </material_1.Box>
          {actions && <material_1.Box>{actions}</material_1.Box>}
        </material_1.Box>
        <material_1.Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: theme.spacing(3),
        }}>
          {children}
        </material_1.Box>
      </material_1.Container>
    </MainLayout_1.MainLayout>);
};
exports.DashboardLayout = DashboardLayout;
//# sourceMappingURL=DashboardLayout.js.map