import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router';
import { useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import MainLayout from '@/layouts/MainLayout';
import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import { Shield, LogOut, User } from 'lucide-react';

export const Route = createRootRoute({
  component: RootComponent,
});

// Páginas sin layout (login y register)
const authPages = ['/login', '/register'];

function RootComponent() {
  const { user, isAuthenticated, isLoading, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // TODOS LOS HOOKS DEBEN IR AL PRINCIPIO - ANTES DE CUALQUIER RETURN
  // Si no está autenticado, redirigir a login
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !authPages.includes(location.pathname)) {
      navigate({ to: '/login' });
    }
  }, [isLoading, isAuthenticated, location.pathname, navigate]);

  // Debug: Log current state
  console.log('RootComponent Debug:', {
    user,
    isAuthenticated,
    isLoading,
    isAdmin: isAdmin(),
    pathname: location.pathname
  });

  // Función para manejar el logout completo
  const handleLogoutAndRedirect = async () => {
    try {
      await logout();
      // Limpiar localStorage completamente
      localStorage.clear();
      // Redirigir al login
      navigate({ to: '/login' });
    } catch (error) {
      console.error('Error during logout:', error);
      // Forzar limpieza y redirección
      localStorage.clear();
      navigate({ to: '/login' });
    }
  };

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
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando acceso...</p>
          </div>
        </div>
        <Toaster position="bottom-right" />
      </ToastProvider>
    );
  }

  // Validación de admin habilitada
  // Si está autenticado pero no es admin, mostrar error
  if (isAuthenticated && user && !isAdmin()) {
    return (
      <ToastProvider>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Icono de acceso denegado */}
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <Shield className="w-10 h-10 text-red-500" />
            </div>
            
            {/* Título */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Acceso Restringido
            </h1>
            
            {/* Descripción */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              Esta aplicación está diseñada exclusivamente para administradores. 
              Tu cuenta no tiene los permisos necesarios para acceder.
            </p>
            
            {/* Información del usuario */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <User className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Información de tu cuenta</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Rol:</span> {
                    user.rol === 'ADMINISTRATOR' ? 'Administrador' : 
                    user.rol === 'CLIENT' ? 'Cliente' : 
                    user.rol === 'admin' ? 'Administrador' :
                    user.rol === 'user' ? 'Cliente' : 'Invitado'
                  }
                </p>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="space-y-3">
              <button 
                onClick={handleLogoutAndRedirect}
                className="w-full flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors duration-200 font-medium"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Cerrar Sesión y Volver
              </button>
              
              <p className="text-xs text-gray-500 mt-4">
                Si crees que esto es un error, contacta al administrador del sistema
              </p>
            </div>
          </div>
        </div>
        <Toaster position="bottom-right" />
      </ToastProvider>
    );
  }

  // Si está autenticado, mostrar con layout persistente (sin validar admin por ahora)
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
