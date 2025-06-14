import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import '@/styles/custom/welcome.css';
import { useAuth } from '@/context/AuthContext';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirecciona automáticamente al login si no está autenticado
      navigate({ to: '/login' });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Mientras se hace la redirección, muestra loading
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const welcomeMessage = user?.name
    ? `Bienvenido, ${user.name}!`
    : 'Bienvenido!, hackerman';

  return (
    <div className="p-4 h-full flex flex-col items-center justify-center font-montserrat">
      <h1 className="animate-welcome text-6xl md:text-8xl font-bold text-gray-700 tracking-tight text-center">
        {welcomeMessage}
      </h1>
    </div>
  );
}
