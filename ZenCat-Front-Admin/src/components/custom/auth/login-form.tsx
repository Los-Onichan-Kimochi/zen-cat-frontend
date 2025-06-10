import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/api/auth/auth-service';
import { toast } from 'sonner';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos vacíos
    if (!email.trim() || !password.trim()) {
      toast.error('Error de validación', {
        description: 'El email y contraseña son obligatorios'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Intentar login con el backend
      console.log('LoginForm: Attempting login with:', { email });
      const response = await authService.login({ email: email.trim(), password });
      
      console.log('LoginForm: Login successful, response:', response);
      
      // Validar que la respuesta tenga la estructura esperada
      if (!response.user || !response.tokens?.access_token) {
        throw new Error('Respuesta del servidor inválida - faltan datos de usuario o tokens');
      }

      // El authService ya guarda los tokens en cookies
      // Ahora guardamos el usuario en el context
      const user = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name || response.user.email,
        role: 'admin' as const,
        password: '', // No guardamos la contraseña
        isAuthenticated: true,
        permissions: ['admin'],
        avatar: response.user.image_url || '',
        address: '',
        district: '',
        phone: ''
      };

      console.log('LoginForm: Setting user in context:', user);
      login(user);
      
      toast.success('Inicio de sesión exitoso', {
        description: `Bienvenido, ${user.name}!`
      });
      
      onLoginSuccess?.();
      navigate({ to: '/' });
    } catch (error: any) {
      console.error('LoginForm: Login error:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Credenciales inválidas';
      
      if (error.message) {
        if (error.message.includes('500')) {
          errorMessage = 'Credenciales incorrectas - Usuario no encontrado o contraseña inválida';
        } else if (error.message.includes('401')) {
          errorMessage = 'Credenciales incorrectas';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Error de conexión - Verifique su internet o que el servidor esté funcionando';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error('Error al iniciar sesión', {
        description: errorMessage
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

          <div className="mt-4 text-center text-sm text-gray-500">
            ¿No tienes una cuenta?{' '}
            <a href="#" className="underline">
              Comunícate con tu jefe
            </a>
          </div>
          {/* TODO: Add remember me, forgot password links here */}
        </CardContent>
      </Card>
    </>
  );
}
