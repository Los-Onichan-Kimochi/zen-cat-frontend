import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { authService } from '@/api/auth/auth-service';
import { LoginRequest, RegisterRequest } from '@/types/auth';

// Query keys
export const authQueryKeys = {
  currentUser: ['auth', 'currentUser'] as const,
};

// Hook for getting current user
export function useCurrentUser() {
  return useQuery({
    queryKey: authQueryKeys.currentUser,
    queryFn: authService.getCurrentUser,
    enabled: authService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors (authentication failed)
      if (
        error?.message?.includes('401') ||
        error?.message?.includes('Authentication failed')
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Hook for login
export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data) => {
      // Cache the current user data
      queryClient.setQueryData(authQueryKeys.currentUser, data.user);

      toast.success('Inicio de sesión exitoso', {
        description: `Bienvenido, ${data.user.name}!`,
      });

      // Redirect to dashboard
      navigate({ to: '/' });
    },
    onError: (error: Error) => {
      toast.error('Error al iniciar sesión', {
        description: error.message || 'Credenciales inválidas',
      });
    },
  });
}

// Hook for register
export function useRegister() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (userData: RegisterRequest) => authService.register(userData),
    onSuccess: (data) => {
      // Cache the current user data
      queryClient.setQueryData(authQueryKeys.currentUser, data.user);

      toast.success('Registro exitoso', {
        description: `Bienvenido, ${data.user.name}!`,
      });

      // Redirect to dashboard
      navigate({ to: '/' });
    },
    onError: (error: Error) => {
      toast.error('Error al registrarse', {
        description: error.message || 'No se pudo completar el registro',
      });
    },
  });
}

// Hook for logout
export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();

      toast.success('Sesión cerrada correctamente');

      // Redirect to login
      navigate({ to: '/login' });
    },
    onError: (error: Error) => {
      toast.error('Error al cerrar sesión', {
        description: error.message,
      });
    },
  });
}

// Hook for checking authentication status
export function useAuthStatus() {
  const { data: user, isLoading, error } = useCurrentUser();

  return {
    user,
    isAuthenticated: !!user && authService.isAuthenticated(),
    isLoading,
    error,
  };
}
