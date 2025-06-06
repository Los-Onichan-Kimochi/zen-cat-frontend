import MainLayout from '@/layouts/MainLayout';
import { createRootRoute, Outlet, redirect, useRouterState } from '@tanstack/react-router';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';


export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    try {
      const savedUser = localStorage.getItem("user");
      const user = savedUser ? JSON.parse(savedUser) : null;

      if (!user && location.pathname !== "/login") {
        throw redirect({ to: "/login" });
      }

      if (user && location.pathname === "/login") {
        throw redirect({ to: "/" });
      }
    } catch (error) {
      console.error("Error in beforeLoad, redirecting to login:", error);
      throw redirect({ to: "/login" });
    }
  },
  component: RootComponent,
});

function RootComponent() {
  const routerState = useRouterState();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && routerState.location.pathname !== '/login') {
      navigate({ to: '/login', replace: true });
    }
  }, [user, routerState.location.pathname, navigate]);

  const showLayout = !!user && routerState.location.pathname !== '/login';

  return showLayout ? (
    <MainLayout user={user}>
      <Outlet />
    </MainLayout>
  ) : (
    <Outlet />
  );
}
