import React from 'react';
import { Outlet, useLocation } from '@tanstack/react-router';
import { TopBar } from '@/components/ui/TopBar';
import { useAuth } from '@/context/AuthContext';

// Páginas públicas que no requieren autenticación
const publicPages = [
  '/',
  '/como-funciona',
  '/contacto',
  '/login',
  '/signup',
  '/forgot',
  '/pin',
];

const MainLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading, isClient } = useAuth();
  const location = useLocation();

  // Verificar si la página actual es pública
  const isPublicPage = publicPages.some(
    (page) =>
      location.pathname === page || location.pathname.startsWith(page + '/'),
  );

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Si es una página pública, mostrar sin restricciones
  if (isPublicPage) {
    return (
      <div className="app-layout">
        <TopBar />
        <div className="content">
          <Outlet />
        </div>
      </div>
    );
  }

  // Para páginas protegidas, verificar autenticación y rol
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Acceso Restringido
          </h2>
          <p className="text-gray-600 mb-4">
            Necesitas iniciar sesión para acceder a esta página.
          </p>
          <a
            href="/login"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Iniciar Sesión
          </a>
        </div>
      </div>
    );
  }

  // Verificar que el usuario tenga rol de cliente para páginas protegidas
  if (isAuthenticated && user && !isClient()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 mb-4">
            Esta aplicación es solo para clientes registrados.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Tu rol actual:{' '}
            {user.rol === 'ADMINISTRATOR'
              ? 'Administrador'
              : user.rol === 'CLIENT'
                ? 'Cliente'
                : 'Invitado'}
          </p>
          <a
            href="/"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Volver al Inicio
          </a>
        </div>
      </div>
    );
  }

  // Usuario autenticado y con rol correcto
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
