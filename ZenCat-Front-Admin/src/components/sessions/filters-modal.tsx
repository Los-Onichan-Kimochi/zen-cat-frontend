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
import { SessionFilters } from './filters';
import { SessionState } from '@/types/session';

interface SessionFiltersModalProps {
  open: boolean;
  onClose: () => void;
  filters: SessionFilters;
  onApplyFilters: (filters: SessionFilters) => void;
  onClearFilters: () => void;
}

export const SessionFiltersModal = React.memo(function SessionFiltersModal({
  open,
  onClose,
  filters,
  onApplyFilters,
  onClearFilters,
}: SessionFiltersModalProps) {
  const [localFilters, setLocalFilters] = useState<SessionFilters>(filters);

  const handleInputChange = useCallback((key: keyof SessionFilters, value: string | number) => {
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
      delete newFilters[key as keyof SessionFilters];
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
            Filtros de Sesiones
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} activo{activeFiltersCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              type="text"
              placeholder="Buscar por título..."
              value={localFilters.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              placeholder="Seleccionar fecha..."
              value={localFilters.date || ''}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Select 
              value={localFilters.state || 'all'} 
              onValueChange={(value) => handleInputChange('state', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value={SessionState.SCHEDULED}>Programada</SelectItem>
                <SelectItem value={SessionState.ONGOING}>En curso</SelectItem>
                <SelectItem value={SessionState.COMPLETED}>Completada</SelectItem>
                <SelectItem value={SessionState.CANCELLED}>Cancelada</SelectItem>
                <SelectItem value={SessionState.RESCHEDULED}>Reprogramada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Capacidad */}
          <div className="space-y-2">
            <Label>Capacidad</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="min_capacity" className="text-sm text-gray-600">
                  Mínima
                </Label>
                <Input
                  id="min_capacity"
                  type="number"
                  placeholder="0"
                  value={localFilters.min_capacity || ''}
                  onChange={(e) => handleInputChange('min_capacity', e.target.value ? Number(e.target.value) : '')}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="max_capacity" className="text-sm text-gray-600">
                  Máxima
                </Label>
                <Input
                  id="max_capacity"
                  type="number"
                  placeholder="100"
                  value={localFilters.max_capacity || ''}
                  onChange={(e) => handleInputChange('max_capacity', e.target.value ? Number(e.target.value) : '')}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Registrados */}
          <div className="space-y-2">
            <Label>Registrados</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="min_registered" className="text-sm text-gray-600">
                  Mínimo
                </Label>
                <Input
                  id="min_registered"
                  type="number"
                  placeholder="0"
                  value={localFilters.min_registered || ''}
                  onChange={(e) => handleInputChange('min_registered', e.target.value ? Number(e.target.value) : '')}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="max_registered" className="text-sm text-gray-600">
                  Máximo
                </Label>
                <Input
                  id="max_registered"
                  type="number"
                  placeholder="100"
                  value={localFilters.max_registered || ''}
                  onChange={(e) => handleInputChange('max_registered', e.target.value ? Number(e.target.value) : '')}
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
                      {key === 'title' && `Título: ${value}`}
                      {key === 'date' && `Fecha: ${value}`}
                      {key === 'state' && `Estado: ${value}`}
                      {key === 'min_capacity' && `Min. capacidad: ${value}`}
                      {key === 'max_capacity' && `Max. capacidad: ${value}`}
                      {key === 'min_registered' && `Min. registrados: ${value}`}
                      {key === 'max_registered' && `Max. registrados: ${value}`}
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