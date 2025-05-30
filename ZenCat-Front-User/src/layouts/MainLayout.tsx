import React from 'react';
import { Outlet } from '@tanstack/react-router';
import { TopBar } from '@/components/ui/TopBar';

const MainLayout: React.FC = () => {
  return (
    <div className="app-layout">
      <TopBar />
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;

