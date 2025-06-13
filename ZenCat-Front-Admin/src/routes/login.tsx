import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import '@/styles/custom/login.css';
import { LoginForm } from '@/components/custom/auth/login-form';
import { useAuth } from '@/context/AuthContext';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

// TODO: Add a forgot password button
// TODO: Add a register button
// TODO: Add a remember me checkbox
// TODO: Add a forgot password modal
// TODO: Add a register modal
// TODO: Add a social login buttons

function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Si ya está autenticado, redirecciona al dashboard
      navigate({ to: '/' });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:flex w-1/2 login-background bg-black items-center justify-center bg-cover bg-center animate-scroll-right"></div>
      {/* Right: Login Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-200 bg-opacity-50 backdrop-blur-sm">
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;
