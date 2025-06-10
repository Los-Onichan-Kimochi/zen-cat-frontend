import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/layouts/MainLayout';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
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
  
  // Si está autenticado, mostrar con layout persistente
  if (isAuthenticated && user) {
    return (
      <MainLayout user={user}>
        <Outlet />
      </MainLayout>
    );
  }
  
  // Para rutas sin autenticación o cargando
  return <Outlet />;
}
