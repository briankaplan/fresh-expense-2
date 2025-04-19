var __importDefault =
  (this && this.__importDefault) || ((mod) => (mod && mod.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppLayout = void 0;
const react_1 = __importDefault(require("react"));
const antd_1 = require("antd");
const react_router_dom_1 = require("react-router-dom");
const icons_1 = require("@ant-design/icons");
const useAuth_1 = require("../../hooks/useAuth");
require("../../styles/App.css");
const { Header, Content, Sider, Footer } = antd_1.Layout;
const AppLayout = () => {
  const { logout } = (0, useAuth_1.useAuth)();
  const location = (0, react_router_dom_1.useLocation)();
  const menuItems = [
    {
      key: "/dashboard",
      icon: <icons_1.DashboardOutlined />,
      label: <react_router_dom_1.Link to="/dashboard">Dashboard</react_router_dom_1.Link>,
    },
    {
      key: "/transactions",
      icon: <icons_1.TransactionOutlined />,
      label: <react_router_dom_1.Link to="/transactions">Transactions</react_router_dom_1.Link>,
    },
    {
      key: "/settings",
      icon: <icons_1.SettingOutlined />,
      label: <react_router_dom_1.Link to="/settings">Settings</react_router_dom_1.Link>,
    },
    {
      key: "logout",
      icon: <icons_1.LogoutOutlined />,
      label: "Logout",
      onClick: logout,
    },
  ];
  return (
    <antd_1.Layout className="app-layout">
      <Header className="app-header">
        <h1 className="app-title">Fresh Expense</h1>
      </Header>
      <antd_1.Layout>
        <Sider className="app-sider" width={200}>
          <antd_1.Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            className="app-menu"
            items={menuItems}
          />
        </Sider>
        <antd_1.Layout>
          <Content className="app-content">
            <react_router_dom_1.Outlet />
          </Content>
          <Footer className="app-footer">Fresh Expense ©{new Date().getFullYear()}</Footer>
        </antd_1.Layout>
      </antd_1.Layout>
    </antd_1.Layout>
  );
};
exports.AppLayout = AppLayout;
//# sourceMappingURL=AppLayout.js.map
