import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/context/AuthContext';
import { API_CONFIG } from '@/config/api';

const ChangePasswordDialog = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Las nuevas contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/user/change-password/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            current_password: currentPassword,
            new_password: newPassword,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Error al cambiar la contraseña');
      }

      // Success - reset form and close dialog
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);

      // You might want to show a success message here
      alert('Contraseña cambiada exitosamente');
    } catch (err: any) {
      console.error('Password change error:', err);
      setError(err.message || 'Error desconocido al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[20%]">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full cursor-pointer bg-white text-gray-700 hover:bg-gray-50"
          >
            Cambiar contraseña
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambio de contraseña</AlertDialogTitle>
            <AlertDialogDescription>
              Ingrese su contraseña actual, la nueva contraseña y la
              verificación de la nueva contraseña.
            </AlertDialogDescription>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </AlertDialogHeader>

          <form
            id="passwordForm"
            onSubmit={handleSubmit}
            className="space-y-4 mt-4"
          >
            <div>
              <label htmlFor="currentPassword" className="sr-only">
                Contraseña actual
              </label>
              {/*                      <Input
                                id="currentPassword"
                                type="password"
                                placeholder="Contraseña actual"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                disabled={true}
                            />*/}
            </div>
            <div>
              <label htmlFor="newPassword" className="sr-only">
                Nueva contraseña
              </label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Nueva contraseña (mínimo 8 caracteres)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                minLength={8}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirmar nueva contraseña
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirmar nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </form>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              type="submit"
              form="passwordForm"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChangePasswordDialog;
