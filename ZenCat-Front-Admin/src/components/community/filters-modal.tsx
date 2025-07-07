import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Search, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CommunityFilters } from './filters';

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: CommunityFilters;
  onFiltersChange: (filters: CommunityFilters) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
}

export function CommunityFiltersModal({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onClearFilters,
  onApplyFilters,
}: FiltersModalProps) {
  const [localFilters, setLocalFilters] = useState<CommunityFilters>(filters);

  // Sincronizar filtros locales cuando cambien los filtros externos
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Memoizar contador de filtros activos
  const activeFiltersCount = useMemo(() => {
    return Object.entries(localFilters).filter(
      ([key, value]) =>
        key !== 'page' &&
        key !== 'limit' &&
        value !== undefined &&
        value !== '' &&
        value !== null,
    ).length;
  }, [localFilters]);

  const updateLocalFilter = useCallback(
    (key: keyof CommunityFilters, value: any) => {
      setLocalFilters((prev) => ({
        ...prev,
        [key]: value === '' ? undefined : value,
      }));
    },
    [],
  );

  const handleClearFilters = useCallback(() => {
    const clearedFilters = {
      page: 1,
      limit: localFilters.limit || 25,
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  }, [localFilters.limit, onClearFilters]);

  const handleApplyFilters = useCallback(() => {
    onFiltersChange(localFilters);
    onApplyFilters();
    onClose();
  }, [localFilters, onFiltersChange, onApplyFilters, onClose]);

  const handleNumberChange = useCallback(
    (key: keyof CommunityFilters, value: string) => {
      const numValue = value === '' ? undefined : parseInt(value, 10);
      if (value === '' || (!isNaN(numValue!) && numValue! >= 0)) {
        updateLocalFilter(key, numValue);
      }
    },
    [updateLocalFilter],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter size={20} />
            Filtros de Comunidades
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''}{' '}
                activo{activeFiltersCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Búsqueda por Nombre */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Label htmlFor="name" className="text-sm font-semibold">
                Búsqueda por Nombre
              </Label>
            </div>
            <Input
              id="name"
              placeholder="Buscar por nombre de comunidad..."
              value={localFilters.name || ''}
              onChange={(e) => updateLocalFilter('name', e.target.value)}
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Búsqueda por Propósito */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Label htmlFor="purpose" className="text-sm font-semibold">
                Búsqueda por Propósito
              </Label>
            </div>
            <Input
              id="purpose"
              placeholder="Buscar por propósito de comunidad..."
              value={localFilters.purpose || ''}
              onChange={(e) => updateLocalFilter('purpose', e.target.value)}
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Rango de Suscripciones */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <Label className="text-sm font-semibold">
                Rango de Suscripciones
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="min_subscriptions" className="text-xs text-gray-600">
                  Mínimo
                </Label>
                <Input
                  id="min_subscriptions"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={localFilters.min_subscriptions?.toString() || ''}
                  onChange={(e) => handleNumberChange('min_subscriptions', e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_subscriptions" className="text-xs text-gray-600">
                  Máximo
                </Label>
                <Input
                  id="max_subscriptions"
                  type="number"
                  min="0"
                  placeholder="1000"
                  value={localFilters.max_subscriptions?.toString() || ''}
                  onChange={(e) => handleNumberChange('max_subscriptions', e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Filtra comunidades por el número de suscripciones en el rango especificado
            </p>
          </div>

          {/* Resumen de filtros */}
          {activeFiltersCount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-800 font-medium">
                  Filtros Aplicados ({activeFiltersCount})
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(localFilters)
                  .filter(([key, value]) => 
                    key !== 'page' && 
                    key !== 'limit' && 
                    value !== undefined && 
                    value !== '' && 
                    value !== null
                  )
                  .map(([key, value]) => (
                    <Badge key={key} variant="outline" className="text-xs bg-white">
                      {key === 'name' && `Nombre: ${value}`}
                      {key === 'purpose' && `Propósito: ${value}`}
                      {key === 'min_subscriptions' && `Min: ${value}`}
                      {key === 'max_subscriptions' && `Max: ${value}`}
                    </Badge>
                  ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 cursor-pointer"
            >
              Cancelar
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="flex-1 cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-300"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            )}
            <Button
              onClick={handleApplyFilters}
              className="flex-1 cursor-pointer bg-blue-600 hover:bg-blue-700"
            >
              <Filter className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 