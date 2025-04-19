const __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        let desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: () => m[k],
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
const __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : (o, v) => {
        o.default = v;
      });
const __importStar =
  (this && this.__importStar) ||
  (() => {
    let ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          const ar = [];
          for (const k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod?.__esModule) return mod;
      const result = {};
      if (mod != null)
        for (let k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
const __importDefault =
  (this && this.__importDefault) || ((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const AuthContext_1 = require("../context/AuthContext");
const HealthCheck_1 = __importDefault(require("@/shared/components/HealthCheck"));
const DRAWER_WIDTH = 240;
const navigationItems = [
  {
    text: "Dashboard",
    icon: <icons_material_1.Dashboard />,
    path: "/dashboard",
  },
  {
    text: "Expenses",
    icon: <icons_material_1.AttachMoney />,
    path: "/expenses",
  },
  {
    text: "Receipts",
    icon: <ReceiptIcon />,
    children: [
      {
        text: "Library",
        icon: <icons_material_1.Storage />,
        path: "/receipts",
      },
      {
        text: "Upload",
        icon: <icons_material_1.CloudUpload />,
        path: "/receipts/upload",
      },
      {
        text: "Categories",
        icon: <CategoryIcon />,
        path: "/receipts/categories",
      },
    ],
  },
  {
    text: "Accounts",
    icon: <icons_material_1.AccountBalance />,
    path: "/accounts",
  },
  {
    text: "Subscriptions",
    icon: <icons_material_1.Subscriptions />,
    path: "/subscriptions",
  },
  {
    text: "Reports",
    icon: <icons_material_1.Assessment />,
    children: [
      {
        text: "Generated Reports",
        icon: <icons_material_1.Description />,
        path: "/reports",
      },
      {
        text: "Templates",
        icon: <icons_material_1.Description />,
        path: "/reports/templates",
      },
    ],
  },
  { text: "Settings", icon: <icons_material_1.Settings />, path: "/settings" },
];
const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = (0, react_1.useState)(false);
  const [expandedItems, setExpandedItems] = (0, react_1.useState)([]);
  const theme = (0, material_1.useTheme)();
  const isMobile = (0, material_1.useMediaQuery)(theme.breakpoints.down("sm"));
  const location = (0, react_router_dom_1.useLocation)();
  const { user, logout } = (0, AuthContext_1.useAuth)();
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const handleExpandClick = (text) => {
    setExpandedItems((prev) => {
      if (prev.includes(text)) {
        return prev.filter((item) => item !== text);
      }
      return [...prev, text];
    });
  };
  const renderNavItems = (items, depth = 0) => {
    return items.map((item) => {
      const isSelected = item.path != null;
      const isExpanded = expandedItems.includes(item.text);
      const hasChildren = item.children && item.children.length > 0;
      return (
        <react_1.default.Fragment key={item.text}>
          <material_1.ListItem
            button
            component={item.path ? react_router_dom_1.Link : "div"}
            to={item.path}
            selected={isSelected}
            onClick={() => {
              if (hasChildren) {
                handleExpandClick(item.text);
              }
              if (isMobile && !hasChildren) {
                handleDrawerToggle();
              }
            }}
            sx={{
              pl: depth * 2 + 2,
              color: isSelected ? "primary.main" : "text.primary",
            }}
          >
            <material_1.ListItemIcon sx={{ color: isSelected ? "primary.main" : "inherit" }}>
              {item.icon}
            </material_1.ListItemIcon>
            <material_1.ListItemText primary={item.text} />
            {hasChildren && (
              <material_1.IconButton edge="end" size="small">
                {isExpanded ? <icons_material_1.ExpandLess /> : <icons_material_1.ExpandMore />}
              </material_1.IconButton>
            )}
          </material_1.ListItem>
          {hasChildren && (
            <material_1.Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <material_1.List component="div" disablePadding>
                {renderNavItems(item.children || [], depth + 1)}
              </material_1.List>
            </material_1.Collapse>
          )}
        </react_1.default.Fragment>
      );
    });
  };
  const drawer = (
    <material_1.Box sx={{ height: "100%", bgcolor: "background.paper" }}>
      <material_1.Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <material_1.Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: "primary.main",
          }}
        >
          {user?.firstName?.[0]}
        </material_1.Avatar>
        <material_1.Box>
          <material_1.Typography variant="subtitle1">
            {user?.firstName} {user?.lastName}
          </material_1.Typography>
          <material_1.Typography variant="body2" color="textSecondary">
            {user?.email}
          </material_1.Typography>
        </material_1.Box>
      </material_1.Box>
      <material_1.Divider />
      <material_1.List>
        {navigationItems.map((item) => (
          <material_1.ListItem
            button
            key={item.text}
            onClick={() => {
              if (item.path) {
                handleDrawerToggle();
              }
            }}
            selected={location.pathname != null}
            sx={{
              my: 0.5,
              mx: 1,
              borderRadius: 1,
              "&.Mui-selected": {
                bgcolor: "primary.dark",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              },
            }}
          >
            <material_1.ListItemIcon
              sx={{ color: location.pathname != null ? "white" : "inherit" }}
            >
              {item.icon}
            </material_1.ListItemIcon>
            <material_1.ListItemText primary={item.text} />
          </material_1.ListItem>
        ))}
      </material_1.List>
      <material_1.Box sx={{ mt: "auto", p: 2 }}>
        <material_1.Button
          fullWidth
          variant="outlined"
          color="error"
          onClick={logout}
          sx={{ mt: 2 }}
        >
          Logout
        </material_1.Button>
      </material_1.Box>
    </material_1.Box>
  );
  return (
    <material_1.Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <material_1.AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          bgcolor: "background.paper",
          boxShadow: "none",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <material_1.Toolbar>
          <material_1.IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <icons_material_1.Menu />
          </material_1.IconButton>
          <material_1.Box sx={{ flexGrow: 1 }} />
          <HealthCheck_1.default />
          <material_1.IconButton color="inherit">
            <icons_material_1.Notifications />
          </material_1.IconButton>
          <material_1.IconButton color="inherit">
            <icons_material_1.Person />
          </material_1.IconButton>
          <material_1.IconButton color="inherit">
            {theme.palette.mode != null ? (
              <icons_material_1.LightMode />
            ) : (
              <icons_material_1.DarkMode />
            )}
          </material_1.IconButton>
        </material_1.Toolbar>
      </material_1.AppBar>
      <material_1.Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        <material_1.Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              bgcolor: "background.paper",
              backgroundImage: "none",
            },
          }}
        >
          {drawer}
        </material_1.Drawer>
        <material_1.Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              bgcolor: "background.paper",
              backgroundImage: "none",
              border: "none",
              boxShadow: 2,
            },
          }}
          open
        >
          {drawer}
        </material_1.Drawer>
      </material_1.Box>
      <material_1.Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: "64px",
        }}
      >
        <react_router_dom_1.Outlet />
      </material_1.Box>
    </material_1.Box>
  );
};
exports.default = MainLayout;
//# sourceMappingURL=MainLayout.js.map
