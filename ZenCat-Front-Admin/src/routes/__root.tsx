import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/layouts/MainLayout';
import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // No mostrar layout en la página de login
  if (location.pathname === '/login') {
    return <Outlet />;
  }

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  useEffect(() => {
    if (!isLoading && !isAuthenticated && location.pathname !== '/login') {
      navigate({ to: '/login' });
    }
  }, [isLoading, isAuthenticated, location.pathname, navigate]);

  // Si está autenticado, mostrar con layout persistente
  if (isAuthenticated && user) {
    return (
      <MainLayout user={user}>
        <Outlet />
      </MainLayout>
    );
  }

  // Para rutas sin autenticación (como login) o mientras se redirige
  return <Outlet />;
}
