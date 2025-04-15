import React from 'react';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">{/* Sidebar content */}</aside>
      <main className="dashboard-main">
        <header className="dashboard-header">{/* Header content */}</header>
        <div className="dashboard-content">{children}</div>
        <footer className="dashboard-footer">{/* Footer content */}</footer>
      </main>
    </div>
  );
};

export default DashboardLayout;
