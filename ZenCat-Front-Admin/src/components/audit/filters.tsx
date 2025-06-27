import React, { useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, X, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AuditLogFilters, AuditAction, AuditEntityType, ACTION_CONFIGS, ENTITY_CONFIGS } from '@/types/audit';

interface FiltersProps {
  filters: AuditLogFilters;
  onOpenFilters?: () => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

export const AuditFilters = React.memo(function AuditFilters({
  filters,
  onOpenFilters,
  onClearFilters,
  hasActiveFilters = false,
}: FiltersProps) {
  // Memoizar el contador de filtros activos
  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => 
      key !== 'page' && key !== 'limit' && value !== undefined && value !== ''
    ).length;
  }, [filters]);

  // Memoizar la función para obtener la etiqueta de filtro
  const getFilterLabel = useCallback((key: string, value: any): string => {
    switch (key) {
      case 'user_search':
        return `Usuario: ${value}`;
      case 'action':
        return `Acción: ${ACTION_CONFIGS[value]?.label || value}`;
      case 'entity_type':
        return `Entidad: ${ENTITY_CONFIGS[value]?.label || value}`;
      case 'user_role':
        return `Rol: ${value}`;
      case 'start_date':
        return `Desde: ${new Date(value).toLocaleDateString()}`;
      case 'end_date':
        return `Hasta: ${new Date(value).toLocaleDateString()}`;
      default:
        return `${key}: ${value}`;
    }
  }, []);

  // Memoizar los filtros activos
  const activeFilters = useMemo(() => {
    return Object.entries(filters)
      .filter(([key, value]) => 
        key !== 'page' && key !== 'limit' && value !== undefined && value !== ''
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
            className="transition-all duration-200 hover:bg-black hover:text-white hover:border-black"
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
            {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} aplicado{activeFiltersCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onOpenFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onOpenFilters}
              className="transition-all duration-200 hover:bg-black hover:text-white hover:border-black"
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
              className="transition-all duration-200 hover:bg-black hover:text-white hover:border-black"
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