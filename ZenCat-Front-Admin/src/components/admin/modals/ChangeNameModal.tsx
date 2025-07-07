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
import { User, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { adminSettingsApi } from '@/api/admin/admin-settings';

interface ChangeNameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangeNameModal({ open, onOpenChange }: ChangeNameModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!name.trim()) {
        toast.error('El nombre no puede estar vacío');
        return;
      }

      if (name.trim().length < 2) {
        toast.error('El nombre debe tener al menos 2 caracteres');
        return;
      }

      if (!user?.id) {
        toast.error('Usuario no encontrado');
        return;
      }

      await adminSettingsApi.updateProfile(user.id, {
        name: name.trim(),
      });

      toast.success('Nombre actualizado exitosamente');
      onOpenChange(false);
      
      // Opcional: recargar la página para reflejar los cambios
      window.location.reload();
    } catch (error: any) {
      console.error('Error al actualizar el nombre:', error);
      const errorMessage = error.response?.data?.message || 'Error al actualizar el nombre';
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-lg">Cambiar Nombre</DialogTitle>
              <DialogDescription>
                Actualiza tu nombre de usuario
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nuevo nombre</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ingresa tu nuevo nombre"
              required
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500">
              Nombre actual: <span className="font-medium">{user?.name || 'Sin nombre'}</span>
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
              disabled={isLoading || !name.trim() || name.trim() === user?.name}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700"
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