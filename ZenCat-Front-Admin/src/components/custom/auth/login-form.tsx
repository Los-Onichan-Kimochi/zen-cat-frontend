import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ModalNotifications } from '@/components/custom/common/modal-notifications';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/api/auth/auth-service';
import { useModalNotifications } from '@/hooks/use-modal-notifications';
import { useToast } from '@/context/ToastContext';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

// TODO: Add a forgot password button
// TODO: Add a register button
// TODO: Add a social login buttons
// TODO: Add a remember me checkbox
// TODO: Add a forgot password modal
// TODO: Add a register modal

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { modal, error, closeModal } = useModalNotifications();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones de entrada
    if (!email.trim() || !password.trim()) {
      error('Error de validación', {
        description: 'El email y contraseña son obligatorios',
      });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      error('Email inválido', {
        description: 'Por favor ingrese un email válido',
      });
      return;
    }

    // Validar longitud mínima de contraseña
    if (password.length < 3) {
      error('Contraseña muy corta', {
        description: 'La contraseña debe tener al menos 3 caracteres',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Intentar login con el backend
      console.log('LoginForm: Attempting login with:', { email });
      const response = await authService.login({
        email: email.trim(),
        password,
      });

      console.log('LoginForm: Login successful, response:', response);

      // Validar que la respuesta tenga la estructura esperada
      if (!response.user || !response.tokens?.access_token) {
        throw new Error(
          'Respuesta del servidor inválida - faltan datos de usuario o tokens',
        );
      }

      // El authService ya guarda los tokens en cookies
      // Ahora guardamos el usuario en el context
      // Mapear el rol del backend al frontend (mantener valores originales también)
      const mapRole = (
        backendRole: string,
      ): 'admin' | 'user' | 'guest' | 'ADMINISTRATOR' | 'CLIENT' | 'GUEST' => {
        switch (backendRole) {
          case 'ADMINISTRATOR':
            return 'ADMINISTRATOR';
          case 'CLIENT':
            return 'CLIENT';
          case 'GUEST':
            return 'GUEST';
          case 'admin':
            return 'admin';
          case 'user':
            return 'user';
          case 'guest':
            return 'guest';
          default:
            return 'user'; // Default fallback
        }
      };

      const user = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name || response.user.email,
        rol: mapRole(response.user.rol), // Mapear el rol al formato esperado
        password: '', // No guardamos la contraseña
        isAuthenticated: true,
        permissions:
          response.user.rol === 'ADMINISTRATOR' ? ['admin'] : ['user'],
        avatar: response.user.image_url || '',
        address: '',
        district: '',
        phone: '',
      };

      console.log('LoginForm: Setting user in context:', user);
      login(user);

      // Solo mostrar toast de éxito si el usuario es administrador
      if (response.user.rol === 'ADMINISTRATOR') {
        toast.success('Inicio de Sesión Exitoso', {
          description: `Bienvenido, ${user.name}!`,
        });
      }

      onLoginSuccess?.();
      navigate({ to: '/' });
    } catch (err: any) {
      console.error('LoginForm: Login error:', err);

      // Manejar diferentes tipos de errores con modals específicos
      let errorTitle = 'Error al iniciar sesión';
      let errorMessage = 'Credenciales inválidas';

      if (err.message) {
        if (err.message.includes('500')) {
          errorTitle = 'Error del servidor';
          errorMessage =
            'Credenciales incorrectas - Usuario no encontrado o contraseña inválida';
        } else if (err.message.includes('401')) {
          errorTitle = 'Credenciales incorrectas';
          errorMessage =
            'El email o contraseña son incorrectos. Por favor verifique sus datos.';
        } else if (err.message.includes('403')) {
          errorTitle = 'Acceso denegado';
          errorMessage =
            'Su cuenta no tiene permisos para acceder al panel de administración.';
        } else if (
          err.message.includes('Network') ||
          err.message.includes('fetch')
        ) {
          errorTitle = 'Error de conexión';
          errorMessage =
            'No se pudo conectar con el servidor. Verifique su conexión a internet.';
        } else if (err.message.includes('timeout')) {
          errorTitle = 'Tiempo de espera agotado';
          errorMessage =
            'La conexión tardó demasiado tiempo. Intente nuevamente.';
        } else {
          errorMessage = err.message;
        }
      }

      // Si no hay conexión
      if (!navigator.onLine) {
        errorTitle = 'Sin conexión a internet';
        errorMessage = 'Verifique su conexión a internet e intente nuevamente.';
      }

      error(errorTitle, {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-md shadow-xl bg-white">
        <CardHeader className="flex flex-col items-center gap-2 pt-8">
          <div className="bg-blue-100 rounded-full p-3 mb-2">
            <img src="/ico-astrocat.svg" alt="logo" className="w-20 h-20" />
          </div>
          <h2 className="text-2xl font-bold">Bienvenido :)</h2>
          <p className="text-gray-500 text-sm">
            Inicia sesión en tu cuenta para continuar
          </p>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="nena@maldicion.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              disabled={isLoading}
            />
            <Input
              type="password"
              placeholder="contraseña nena :V"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>
          {/* TODO: Add remember me, forgot password links here */}
        </CardContent>
      </Card>

      <ModalNotifications modal={modal} onClose={closeModal} />
    </>
  );
}
