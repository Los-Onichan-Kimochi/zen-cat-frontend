import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router';
import { useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import MainLayout from '@/layouts/MainLayout';
import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Toaster } from 'sonner';

export const Route = createRootRoute({
  component: RootComponent,
});

// Páginas sin layout (login y register)
const authPages = ['/login', '/register'];

function RootComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (authPages.includes(location.pathname)) {
    return (
      <ToastProvider>
        <Outlet />
        <Toaster position="bottom-right" />
      </ToastProvider>
    );
  }

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <ToastProvider>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
        <Toaster position="bottom-right" />
      </ToastProvider>
    );
  }

  // Si no está autenticado, redirigir a login
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !authPages.includes(location.pathname)) {
      navigate({ to: '/login' });
    }
  }, [isLoading, isAuthenticated, location.pathname, navigate]);

  // Si está autenticado, mostrar con layout persistente
  if (isAuthenticated && user) {
    return (
      <ToastProvider>
        <MainLayout user={user}>
          <Outlet />
        </MainLayout>
        <Toaster position="bottom-right" />
      </ToastProvider>
    );
  }

  // Para rutas sin autenticación (como login) o mientras se redirige
  return (
    <ToastProvider>
      <Outlet />
      <Toaster position="bottom-right" />
    </ToastProvider>
  );
}
