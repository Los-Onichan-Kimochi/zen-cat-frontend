import { Outlet } from '@tanstack/react-router';
import { User } from "@/types/user"
import { TopBar } from "@/components/ui/TopBar";


const MainLayout = () => {
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

