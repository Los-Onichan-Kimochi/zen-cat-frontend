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
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { LocalFilters } from './filters';

interface LocalFiltersModalProps {
  open: boolean;
  onClose: () => void;
  filters: LocalFilters;
  onApplyFilters: (filters: LocalFilters) => void;
  onClearFilters: () => void;
}

export const LocalFiltersModal = React.memo(function LocalFiltersModal({
  open,
  onClose,
  filters,
  onApplyFilters,
  onClearFilters,
}: LocalFiltersModalProps) {
  const [localFilters, setLocalFilters] = useState<LocalFilters>(filters);

  const handleInputChange = useCallback((key: keyof LocalFilters, value: string) => {
    setLocalFilters(prev => {
      const newFilters = { ...prev };
      
      if (key === 'min_capacity' || key === 'max_capacity') {
        // Para números, permitir valores vacíos o números válidos
        if (value === '' || value === null || value === undefined) {
          delete newFilters[key];
        } else {
          const numValue = parseInt(value, 10);
          if (!isNaN(numValue) && numValue >= 0) {
            newFilters[key] = numValue;
          }
        }
      } else {
        // Para strings, mantener vacíos como undefined
        if (value === '' || value === null || value === undefined) {
          delete newFilters[key];
        } else {
          newFilters[key] = value;
        }
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
      delete newFilters[key as keyof LocalFilters];
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
            Filtros de Locales
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} activo{activeFiltersCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nombre del local */}
          <div className="space-y-2">
            <Label htmlFor="local_name">Nombre del Local</Label>
            <Input
              id="local_name"
              type="text"
              placeholder="Buscar por nombre del local..."
              value={localFilters.local_name || ''}
              onChange={(e) => handleInputChange('local_name', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Distrito */}
          <div className="space-y-2">
            <Label htmlFor="district">Distrito</Label>
            <Input
              id="district"
              type="text"
              placeholder="Buscar por distrito..."
              value={localFilters.district || ''}
              onChange={(e) => handleInputChange('district', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Provincia */}
          <div className="space-y-2">
            <Label htmlFor="province">Provincia</Label>
            <Input
              id="province"
              type="text"
              placeholder="Buscar por provincia..."
              value={localFilters.province || ''}
              onChange={(e) => handleInputChange('province', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Región */}
          <div className="space-y-2">
            <Label htmlFor="region">Región</Label>
            <Input
              id="region"
              type="text"
              placeholder="Buscar por región..."
              value={localFilters.region || ''}
              onChange={(e) => handleInputChange('region', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Capacidad */}
          <div className="space-y-2">
            <Label>Capacidad</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Min"
                  value={localFilters.min_capacity || ''}
                  onChange={(e) => handleInputChange('min_capacity', e.target.value)}
                  min="0"
                  className="w-full"
                />
              </div>
              <span className="text-sm text-gray-500">a</span>
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Max"
                  value={localFilters.max_capacity || ''}
                  onChange={(e) => handleInputChange('max_capacity', e.target.value)}
                  min="0"
                  className="w-full"
                />
              </div>
            </div>
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
                      {key === 'local_name' && `Nombre: ${value}`}
                      {key === 'district' && `Distrito: ${value}`}
                      {key === 'province' && `Provincia: ${value}`}
                      {key === 'region' && `Región: ${value}`}
                      {key === 'min_capacity' && `Min. capacidad: ${value}`}
                      {key === 'max_capacity' && `Max. capacidad: ${value}`}
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