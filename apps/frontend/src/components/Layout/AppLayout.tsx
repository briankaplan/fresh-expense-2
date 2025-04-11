import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  TransactionOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/App.css';

const { Header, Content, Sider, Footer } = Layout;

export const AppLayout: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: '/transactions',
      icon: <TransactionOutlined />,
      label: <Link to="/transactions">Transactions</Link>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">Settings</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
    },
  ];

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <h1 className="app-title">Fresh Expense</h1>
      </Header>
      <Layout>
        <Sider className="app-sider" width={200}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            className="app-menu"
            items={menuItems}
          />
        </Sider>
        <Layout>
          <Content className="app-content">
            <Outlet />
          </Content>
          <Footer className="app-footer">
            Fresh Expense ©{new Date().getFullYear()}
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
}; 