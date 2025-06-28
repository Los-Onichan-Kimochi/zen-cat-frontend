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

interface RegisterFormProps {
  onRegisterSuccess?: () => void;
}

export function RegisterForm({ onRegisterSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { modal, error, closeModal } = useModalNotifications();
  const toast = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    // Validar campos vacíos
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      error('Error de validación', {
        description: 'Todos los campos son obligatorios',
      });
      return false;
    }

    // Validar nombre mínimo
    if (formData.name.trim().length < 2) {
      error('Nombre inválido', {
        description: 'El nombre debe tener al menos 2 caracteres',
      });
      return false;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      error('Email inválido', {
        description: 'Por favor ingrese un email válido',
      });
      return false;
    }

    // Validar longitud de contraseña
    if (formData.password.length < 6) {
      error('Contraseña muy corta', {
        description: 'La contraseña debe tener al menos 6 caracteres',
      });
      return false;
    }

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      error('Contraseñas no coinciden', {
        description:
          'La confirmación de contraseña debe ser igual a la contraseña',
      });
      return false;
    }

    // Validar fortaleza de contraseña
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /\d/.test(formData.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      error('Contraseña débil', {
        description:
          'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Intentar registro con el backend
      console.log('RegisterForm: Attempting register with:', {
        name: formData.name,
        email: formData.email,
      });

      const response = await authService.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      console.log('RegisterForm: Registration successful, response:', response);

      // Validar que la respuesta tenga la estructura esperada
      if (!response.user || !response.tokens?.access_token) {
        throw new Error(
          'Respuesta del servidor inválida - faltan datos de usuario o tokens',
        );
      }

      // El authService ya guarda los tokens en cookies
      // Ahora guardamos el usuario en el context
      // Mapear el rol del backend al frontend
      const mapRole = (backendRole: string): 'admin' | 'user' | 'guest' => {
        switch (backendRole) {
          case 'ADMINISTRATOR':
            return 'admin';
          case 'CLIENT':
            return 'user';
          case 'GUEST':
            return 'guest';
          default:
            return 'user'; // Default fallback
        }
      };

      const user = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name || response.user.email,
        role: mapRole(response.user.rol),
        rol: response.user.rol, // Mantener el rol original del backend
        password: '', // No guardamos la contraseña
        isAuthenticated: true,
        permissions:
          response.user.rol === 'ADMINISTRATOR' ? ['admin'] : ['user'],
        avatar: response.user.image_url || '',
        address: '',
        district: '',
        phone: '',
      };

      console.log('RegisterForm: Setting user in context:', user);
      login(user);

      toast.success('Registro Exitoso', {
        description: `¡Bienvenido al sistema, ${user.name}!`,
      });

      onRegisterSuccess?.();
      navigate({ to: '/' });
    } catch (err: any) {
      console.error('RegisterForm: Registration error:', err);

      // Manejar diferentes tipos de errores con modals específicos
      let errorTitle = 'Error en el registro';
      let errorMessage = 'No se pudo crear la cuenta';

      if (err.message) {
        if (
          err.message.includes('409') ||
          err.message.includes('already exists')
        ) {
          errorTitle = 'Email ya registrado';
          errorMessage =
            'Ya existe una cuenta con este email. Intente iniciar sesión o use un email diferente.';
        } else if (err.message.includes('400')) {
          errorTitle = 'Datos inválidos';
          errorMessage =
            'Los datos proporcionados no son válidos. Verifique la información.';
        } else if (err.message.includes('500')) {
          errorTitle = 'Error del servidor';
          errorMessage =
            'Hubo un problema en el servidor. Intente nuevamente más tarde.';
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
          <h2 className="text-2xl font-bold">Crear Cuenta</h2>
          <p className="text-gray-500 text-sm">
            Regístrate para acceder al panel de administración
          </p>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              type="text"
              name="name"
              placeholder="Nombre completo"
              value={formData.name}
              onChange={handleInputChange}
              required
              autoFocus
              disabled={isLoading}
            />
            <Input
              type="email"
              name="email"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            <Input
              type="password"
              name="password"
              placeholder="Contraseña segura"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar contraseña"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            ¿Ya tienes una cuenta?{' '}
            <button
              type="button"
              onClick={() => navigate({ to: '/login' })}
              className="underline text-blue-600 hover:text-blue-800"
            >
              Inicia sesión
            </button>
          </div>
        </CardContent>
      </Card>

      <ModalNotifications modal={modal} onClose={closeModal} />
    </>
  );
}
