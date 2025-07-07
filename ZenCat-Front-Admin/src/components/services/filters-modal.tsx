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
import { ServiceFilters } from './filters';

interface ServiceFiltersModalProps {
  open: boolean;
  onClose: () => void;
  filters: ServiceFilters;
  onApplyFilters: (filters: ServiceFilters) => void;
  onClearFilters: () => void;
}

export const ServiceFiltersModal = React.memo(function ServiceFiltersModal({
  open,
  onClose,
  filters,
  onApplyFilters,
  onClearFilters,
}: ServiceFiltersModalProps) {
  const [localFilters, setLocalFilters] = useState<ServiceFilters>(filters);

  const handleInputChange = useCallback((key: keyof ServiceFilters, value: string | boolean) => {
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
      delete newFilters[key as keyof ServiceFilters];
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
            Filtros de Servicios
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
            <Label htmlFor="name">Nombre del Servicio</Label>
            <Input
              id="name"
              type="text"
              placeholder="Buscar por nombre del servicio..."
              value={localFilters.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              type="text"
              placeholder="Buscar por descripción..."
              value={localFilters.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Tipo de servicio */}
          <div className="space-y-2">
            <Label htmlFor="is_virtual">Tipo de Servicio</Label>
            <Select 
              value={localFilters.is_virtual === undefined ? 'all' : localFilters.is_virtual.toString()} 
              onValueChange={(value) => handleInputChange('is_virtual', value === 'all' ? undefined : value === 'true')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="false">Presencial</SelectItem>
                <SelectItem value="true">Virtual</SelectItem>
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
                      {key === 'description' && `Descripción: ${value}`}
                      {key === 'is_virtual' && `Tipo: ${value ? 'Virtual' : 'Presencial'}`}
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