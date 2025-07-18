import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { RoleFilters } from './filters';

interface RoleFiltersModalProps {
  open: boolean;
  onClose: () => void;
  filters: RoleFilters;
  onApplyFilters: (filters: RoleFilters) => void;
  onClearFilters: () => void;
}

export const RoleFiltersModal = React.memo(function RoleFiltersModal({
  open,
  onClose,
  filters,
  onApplyFilters,
  onClearFilters,
}: RoleFiltersModalProps) {
  const [localFilters, setLocalFilters] = useState<RoleFilters>(filters);

  const handleInputChange = useCallback((key: keyof RoleFilters, value: string) => {
    setLocalFilters(prev => {
      const newFilters = { ...prev };
      
      if (value === '' || value === null || value === undefined) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      
      return newFilters;
    });
  }, []);

  const handleApplyFilters = useCallback(() => {
    onApplyFilters(localFilters);
    onClose();
  }, [localFilters, onApplyFilters, onClose]);

  const handleClearAllFilters = useCallback(() => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    onClearFilters();
    onClose();
  }, [onClearFilters, onClose]);

  const getActiveFiltersCount = useCallback(() => {
    return Object.entries(localFilters).filter(
      ([key, value]) =>
        key !== 'page' &&
        key !== 'limit' &&
        value !== undefined &&
        value !== '' &&
        value !== null,
    ).length;
  }, [localFilters]);

  const removeFilter = useCallback((key: string) => {
    setLocalFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key as keyof RoleFilters];
      return newFilters;
    });
  }, []);

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter size={20} />
            Filtros de Usuarios
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} activo{activeFiltersCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              type="text"
              placeholder="Buscar por nombre..."
              value={localFilters.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Buscar por email..."
              value={localFilters.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Rol */}
          <div className="space-y-2">
            <Label htmlFor="rol">Rol</Label>
            <Select 
              value={localFilters.rol || 'all'} 
              onValueChange={(value) => handleInputChange('rol', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="ADMINISTRATOR">Administrador</SelectItem>
                <SelectItem value="CLIENT">Cliente</SelectItem>
                <SelectItem value="GUEST">Invitado</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">Usuario</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtros activos */}
          {activeFiltersCount > 0 && (
            <div className="space-y-2">
              <Label>Filtros Aplicados</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(localFilters)
                  .filter(([key, value]) => 
                    key !== 'page' && 
                    key !== 'limit' && 
                    value !== undefined && 
                    value !== '' && 
                    value !== null
                  )
                  .map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key === 'name' && `Nombre: ${value}`}
                      {key === 'email' && `Email: ${value}`}
                      {key === 'rol' && `Rol: ${value}`}
                      <button
                        onClick={() => removeFilter(key)}
                        className="ml-1 text-gray-500 hover:text-gray-700 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClearAllFilters}
            className="cursor-pointer"
          >
            Limpiar Todo
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleApplyFilters}
            className="cursor-pointer"
          >
            Aplicar Filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}); 