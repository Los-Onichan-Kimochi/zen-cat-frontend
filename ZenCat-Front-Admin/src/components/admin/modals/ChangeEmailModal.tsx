import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Mail, Save, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { adminSettingsApi } from '@/api/admin/admin-settings';

interface ChangeEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangeEmailModal({ open, onOpenChange }: ChangeEmailModalProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email.trim()) {
        toast.error('El email no puede estar vacío');
        return;
      }

      // Validación básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        toast.error('Ingresa un email válido');
        return;
      }

      if (!user?.id) {
        toast.error('Usuario no encontrado');
        return;
      }

      await adminSettingsApi.updateProfile(user.id, {
        email: email.trim(),
      });

      toast.success('Email actualizado exitosamente');
      onOpenChange(false);
      
      // Opcional: recargar la página para reflejar los cambios
      window.location.reload();
    } catch (error: any) {
      console.error('Error al actualizar el email:', error);
      const errorMessage = error.response?.data?.message || 'Error al actualizar el email';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Mail className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-lg">Cambiar Email</DialogTitle>
              <DialogDescription>
                Actualiza tu dirección de correo electrónico
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Nuevo email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu nuevo email"
              required
              className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
            />
            <p className="text-sm text-gray-500">
              Email actual: <span className="font-medium">{user?.email || 'Sin email'}</span>
            </p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-800 font-medium">Importante</p>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Al cambiar tu email, será necesario usar la nueva dirección para iniciar sesión.
            </p>
          </div>

          <DialogFooter className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !email.trim() || email.trim() === user?.email}
              className="cursor-pointer bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Guardar
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 