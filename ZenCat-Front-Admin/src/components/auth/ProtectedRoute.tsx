import { ReactNode } from 'react';
import { Navigate } from '@tanstack/react-router';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  allowedRoles?: string[];
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  allowedRoles = []
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, isAdmin, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if admin role is required
  if (requireAdmin && !isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">
            No tienes permisos de administrador para acceder a esta página.
          </p>
          <p className="text-sm text-gray-500">
            Tu rol actual: {user?.rol === 'ADMINISTRATOR' ? 'Administrador' : 
                          user?.rol === 'CLIENT' ? 'Cliente' : 'Invitado'}
          </p>
        </div>
      </div>
    );
  }

  // Check if specific roles are allowed
  if (allowedRoles.length > 0 && !allowedRoles.some(role => hasRole(role))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">
            No tienes el rol necesario para acceder a esta página.
          </p>
          <p className="text-sm text-gray-500">
            Tu rol actual: {user?.rol === 'ADMINISTRATOR' ? 'Administrador' : 
                          user?.rol === 'CLIENT' ? 'Cliente' : 'Invitado'}
          </p>
          <p className="text-sm text-gray-500">
            Roles permitidos: {allowedRoles.join(', ')}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
