import MainLayout from '@/layouts/MainLayout';
import { createRootRoute, Outlet, redirect, useRouterState } from '@tanstack/react-router';
import { User } from '@/types/user';
import { authApi } from '@/api/auth/auth';
import { useEffect, useState } from 'react';

// TODO: Implement auth JWT system
export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    try {
      const user = await authApi.getCurrentUser();
      if (!user?.isAuthenticated && location.pathname !== '/login') {
        throw redirect({
          to: '/login',
        });
      }
      if (user?.isAuthenticated && location.pathname === '/login') {
        throw redirect({
          to: '/',
        });
      }
    } catch (error) {
      if (location.pathname !== '/login' && !(error instanceof Function)) {
        console.error('Error in beforeLoad, redirecting to login:', error);
        throw redirect({
          to: '/login',
        });
      } else if (error instanceof Function) {
        throw error;
      }
    }
  },
  component: RootComponent,
});

function RootComponent() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const routerState = useRouterState();

  useEffect(() => {
    const fetchUser = async () => {
      setLoadingUser(true);
      try {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user in RootComponent:', error);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  if (loadingUser) {
    return <div>Loading...</div>;
  }

  const showLayout = user?.isAuthenticated && routerState.location.pathname !== '/login';

  if (showLayout) {
    return (
      <MainLayout user={user!}>
        <Outlet />
      </MainLayout>
    );
  }

  return <Outlet />;
}
