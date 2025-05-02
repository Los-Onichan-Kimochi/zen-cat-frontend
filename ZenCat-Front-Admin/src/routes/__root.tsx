import MainLayout from '@/layouts/MainLayout';
import { createRootRoute, Outlet, redirect } from '@tanstack/react-router';

// TODO: check if user is authenticated implement auth
export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const isAuthenticated = true;
    if (!isAuthenticated && location.pathname !== '/login') {
      throw redirect({
        to: '/login',
      });
    }
  },
  component: RootComponent,
});

function RootComponent() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
