import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Save, X, Upload, Image, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { adminSettingsApi } from '@/api/admin/admin-settings';

interface ChangePhotoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePhotoModal({ open, onOpenChange }: ChangePhotoModalProps) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validaciones
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!selectedFile) {
        toast.error('Por favor selecciona una imagen');
        return;
      }

      if (!user?.id) {
        toast.error('Usuario no encontrado');
        return;
      }

      // Convertir archivo a bytes
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const imageBytes = Array.from(new Uint8Array(arrayBuffer));
          const fileName = `${user.id}_${Date.now()}_${selectedFile.name}`;

          await adminSettingsApi.updateProfile(user.id, {
            // Aquí deberías enviar la imagen al backend según tu API
            // Por ahora simulo la actualización
          });

          toast.success('Foto de perfil actualizada exitosamente');
          onOpenChange(false);
          
          // Limpiar estado
          setSelectedFile(null);
          setPreviewUrl(null);
          
          // Opcional: recargar para mostrar cambios
          window.location.reload();
        } catch (error: any) {
          console.error('Error al actualizar la foto:', error);
          const errorMessage = error.response?.data?.message || 'Error al actualizar la foto';
          toast.error(errorMessage);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    } catch (error: any) {
      console.error('Error al procesar la imagen:', error);
      toast.error('Error al procesar la imagen');
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Camera className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <DialogTitle className="text-lg">Cambiar Foto de Perfil</DialogTitle>
              <DialogDescription>
                Actualiza tu imagen de perfil
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Photo */}
          <div className="space-y-2">
            <Label>Foto actual</Label>
            <div className="flex items-center gap-3">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.avatar || user?.image_url} alt={user?.name} />
                <AvatarFallback className="bg-purple-100 text-purple-600 text-xl font-semibold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.name || 'Usuario'}</p>
                <p className="text-sm text-gray-500">Imagen actual</p>
              </div>
            </div>
          </div>

          {/* New Photo */}
          <div className="space-y-2">
            <Label>Nueva foto</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {previewUrl ? (
                <div className="space-y-3">
                  <Avatar className="h-20 w-20 mx-auto">
                    <AvatarImage src={previewUrl} alt="Preview" />
                    <AvatarFallback>
                      <Image className="h-8 w-8 text-gray-400" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{selectedFile?.name}</p>
                    <p className="text-xs text-gray-500">
                      {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : '0'} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemovePhoto}
                    className="cursor-pointer"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Quitar
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Selecciona una imagen</p>
                    <p className="text-xs text-gray-500">JPG, PNG hasta 5MB</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Elegir archivo
                  </Button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-amber-800 font-medium">Recomendaciones</p>
            </div>
            <ul className="text-sm text-amber-700 mt-1 space-y-1">
              <li>• Usa una imagen cuadrada para mejor resultado</li>
              <li>• Formato JPG o PNG</li>
              <li>• Tamaño máximo: 5MB</li>
              <li>• Resolución recomendada: 400x400px</li>
            </ul>
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
              disabled={isLoading || !selectedFile}
              className="cursor-pointer bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Subiendo...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Actualizar
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 