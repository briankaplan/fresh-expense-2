import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Collapse,
  Avatar,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountBalanceIcon,
  Subscriptions as SubscriptionsIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Description as DescriptionIcon,
  ExpandLess,
  ExpandMore,
  Storage as StorageIcon,
  CloudUpload as CloudUploadIcon,
  Category as CategoryIcon,
  AttachMoney as AttachMoneyIcon,
  Person,
  Notifications,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import HealthCheck from '../components/HealthCheck';

const DRAWER_WIDTH = 240;

interface NavigationItem {
  text: string;
  icon: React.ReactElement;
  path?: string;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Expenses', icon: <AttachMoneyIcon />, path: '/expenses' },
  {
    text: 'Receipts',
    icon: <ReceiptIcon />,
    children: [
      { text: 'Library', icon: <StorageIcon />, path: '/receipts' },
      { text: 'Upload', icon: <CloudUploadIcon />, path: '/receipts/upload' },
      { text: 'Categories', icon: <CategoryIcon />, path: '/receipts/categories' },
    ],
  },
  { text: 'Accounts', icon: <AccountBalanceIcon />, path: '/accounts' },
  { text: 'Subscriptions', icon: <SubscriptionsIcon />, path: '/subscriptions' },
  {
    text: 'Reports',
    icon: <AssessmentIcon />,
    children: [
      { text: 'Generated Reports', icon: <DescriptionIcon />, path: '/reports' },
      { text: 'Templates', icon: <DescriptionIcon />, path: '/reports/templates' },
    ],
  },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleExpandClick = (text: string) => {
    setExpandedItems(prev => {
      if (prev.includes(text)) {
        return prev.filter(item => item !== text);
      }
      return [...prev, text];
    });
  };

  const renderNavItems = (items: NavigationItem[], depth = 0) => {
    return items.map(item => {
      const isSelected = item.path === location.pathname;
      const isExpanded = expandedItems.includes(item.text);
      const hasChildren = item.children && item.children.length > 0;

      return (
        <React.Fragment key={item.text}>
          <ListItem
            button
            component={item.path ? Link : 'div'}
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
              color: isSelected ? 'primary.main' : 'text.primary',
            }}
          >
            <ListItemIcon sx={{ color: isSelected ? 'primary.main' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
            {hasChildren && (
              <IconButton edge="end" size="small">
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
          </ListItem>
          {hasChildren && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderNavItems(item.children || [], depth + 1)}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    });
  };

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'primary.main',
          }}
        >
          {user?.firstName?.[0]}
        </Avatar>
        <Box>
          <Typography variant="subtitle1">
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {user?.email}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List>
        {navigationItems.map(item => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              if (item.path) {
                handleDrawerToggle();
              }
            }}
            selected={location.pathname === item.path}
            sx={{
              my: 0.5,
              mx: 1,
              borderRadius: 1,
              '&.Mui-selected': {
                bgcolor: 'primary.dark',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? 'white' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Button fullWidth variant="outlined" color="error" onClick={logout} sx={{ mt: 2 }}>
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <HealthCheck />
          <IconButton color="inherit">
            <Notifications />
          </IconButton>
          <IconButton color="inherit">
            <Person />
          </IconButton>
          <IconButton color="inherit">
            {theme.palette.mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              bgcolor: 'background.paper',
              backgroundImage: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              bgcolor: 'background.paper',
              backgroundImage: 'none',
              border: 'none',
              boxShadow: 2,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
