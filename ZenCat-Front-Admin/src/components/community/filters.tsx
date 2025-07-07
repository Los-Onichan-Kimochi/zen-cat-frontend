import React, { useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';

export interface CommunityFilters {
  name?: string;
  purpose?: string;
  min_subscriptions?: number;
  max_subscriptions?: number;
  page?: number;
  limit?: number;
}

interface FiltersProps {
  filters: CommunityFilters;
  onOpenFilters?: () => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

export const CommunityFilters = React.memo(function CommunityFilters({
  filters,
  onOpenFilters,
  onClearFilters,
  hasActiveFilters = false,
}: FiltersProps) {
  // Memoizar el contador de filtros activos
  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(
      ([key, value]) =>
        key !== 'page' &&
        key !== 'limit' &&
        value !== undefined &&
        value !== '' &&
        value !== null,
    ).length;
  }, [filters]);

  // Memoizar la función para obtener la etiqueta de filtro
  const getFilterLabel = useCallback((key: string, value: any): string => {
    switch (key) {
      case 'name':
        return `Nombre: ${value}`;
      case 'purpose':
        return `Propósito: ${value}`;
      case 'min_subscriptions':
        return `Min. suscripciones: ${value}`;
      case 'max_subscriptions':
        return `Max. suscripciones: ${value}`;
      default:
        return `${key}: ${value}`;
    }
  }, []);

  // Memoizar los filtros activos
  const activeFilters = useMemo(() => {
    return Object.entries(filters)
      .filter(
        ([key, value]) =>
          key !== 'page' &&
          key !== 'limit' &&
          value !== undefined &&
          value !== '' &&
          value !== null,
      )
      .map(([key, value]) => ({
        key,
        value,
        label: getFilterLabel(key, value),
      }));
  }, [filters, getFilterLabel]);

  if (activeFiltersCount === 0) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={16} />
          <span className="text-sm text-gray-500">Sin filtros aplicados</span>
        </div>
        {onOpenFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenFilters}
            className="transition-all duration-200 hover:bg-black hover:text-white hover:border-black cursor-pointer"
          >
            <Filter size={16} className="mr-2" />
            Filtrar
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={16} />
          <span className="text-sm font-medium">
            {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''}{' '}
            aplicado{activeFiltersCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onOpenFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenFilters}
              className="transition-all duration-200 hover:bg-black hover:text-white hover:border-black cursor-pointer"
            >
              <Filter size={16} className="mr-2" />
              Modificar Filtros
            </Button>
          )}
          {onClearFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="transition-all duration-200 hover:bg-black hover:text-white hover:border-black cursor-pointer"
            >
              <X size={16} className="mr-2" />
              Limpiar Todo
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {activeFilters.map(({ key, label }) => (
          <Badge key={key} variant="secondary" className="text-xs">
            {label}
          </Badge>
        ))}
      </div>
    </div>
  );
}); 