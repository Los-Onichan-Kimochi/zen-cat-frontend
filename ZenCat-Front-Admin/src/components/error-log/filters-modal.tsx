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
// Removed problematic Select components - using native HTML select instead
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  AuditLogFilters,
  getActionConfig,
  getEntityConfig,
  AuditAction,
  AuditEntityType,
} from '@/types/audit';

interface ErrorLogFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AuditLogFilters;
  onFiltersChange: (filters: AuditLogFilters) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
}

// Constants outside component to prevent recreation
const ALL_ACTIONS: AuditAction[] = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'BULK_CREATE',
  'BULK_DELETE',
  'LOGIN',
  'REGISTER',
  'SUBSCRIBE',
  'UNSUBSCRIBE',
  'CREATE_RESERVATION',
  'CANCEL_RESERVATION',
  'UPDATE_PROFILE',
];

const ALL_ENTITY_TYPES: AuditEntityType[] = [
  'USER',
  'COMMUNITY',
  'PROFESSIONAL',
  'LOCAL',
  'PLAN',
  'SERVICE',
  'SESSION',
  'RESERVATION',
  'MEMBERSHIP',
  'ONBOARDING',
  'COMMUNITY_PLAN',
  'COMMUNITY_SERVICE',
  'SERVICE_LOCAL',
  'SERVICE_PROFESSIONAL',
];

// Simple select component that doesn't use portals or complex focus management
function SimpleSelect({
  value,
  onValueChange,
  placeholder,
  options,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: Array<{ value: string; label: string; className?: string }>;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={cn(
        'w-full h-11 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200 hover:border-gray-400 hover:shadow-sm',
        className,
      )}
    >
      <option value="" disabled hidden>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function ErrorLogFiltersModal({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onClearFilters,
  onApplyFilters,
}: ErrorLogFiltersModalProps) {
  // Local state to manage filters without triggering parent updates
  const [localFilters, setLocalFilters] = useState<AuditLogFilters>(filters);

  // Sync local filters with props when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [isOpen, filters]);

  // Memoize the active filters count based on local filters
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

  // Local filter update function - only updates local state
  const updateLocalFilter = useCallback(
    (key: keyof AuditLogFilters, value: any) => {
      setLocalFilters((prev) => ({
        ...prev,
        [key]: value === '' || value === 'all' ? undefined : value,
      }));
    },
    [],
  );

  const formatDate = useCallback(
    (date: Date | undefined) =>
      date ? format(date, 'dd/MM/yyyy', { locale: es }) : 'Seleccionar fecha',
    [],
  );

  const handleApply = useCallback(() => {
    // Update parent state with local filters
    onFiltersChange(localFilters);
    onApplyFilters();
    onClose();
  }, [localFilters, onFiltersChange, onApplyFilters, onClose]);

  const handleClear = useCallback(() => {
    const clearedFilters = {
      page: 1,
      limit: filters.limit,
    };
    setLocalFilters(clearedFilters);
  }, [filters.limit]);

  const handleClose = useCallback(() => {
    // Reset local filters to original when canceling
    setLocalFilters(filters);
    onClose();
  }, [filters, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-6xl min-h-[50vh] max-h-[90vh] min-w-[50vw] overflow-y-auto font-montserrat animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader className="pb-8">
          <DialogTitle className="flex items-center space-x-3 text-xl">
            <Filter className="h-6 w-6 text-gray-600" />
            <span>Filtros Avanzados</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {activeFiltersCount}{' '}
                {activeFiltersCount === 1 ? 'filtro' : 'filtros'}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {/* User Search */}
            <div className="space-y-4">
              <Label
                htmlFor="user-search"
                className="text-sm font-medium text-gray-700"
              >
                Buscar Usuario
              </Label>
              <Input
                id="user-search"
                placeholder="Email o nombre..."
                value={localFilters.user_search || ''}
                onChange={(e) =>
                  updateLocalFilter('user_search', e.target.value)
                }
                className="w-full h-11"
              />
            </div>

            {/* Action Filter */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                Tipo de Acción
              </Label>
              <SimpleSelect
                value={localFilters.action || 'all'}
                onValueChange={(value) => updateLocalFilter('action', value)}
                placeholder="Seleccionar acción"
                options={[
                  { value: 'all', label: 'Todas las acciones' },
                  ...ALL_ACTIONS.map((action) => {
                    const config = getActionConfig(action, false);
                    return { value: action, label: config.label };
                  }),
                ]}
              />
            </div>

            {/* Entity Type Filter */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                Tipo de Entidad
              </Label>
              <SimpleSelect
                value={localFilters.entity_type || 'all'}
                onValueChange={(value) =>
                  updateLocalFilter('entity_type', value)
                }
                placeholder="Seleccionar entidad"
                options={[
                  { value: 'all', label: 'Todas las entidades' },
                  ...ALL_ENTITY_TYPES.map((entityType) => {
                    const config = getEntityConfig(entityType, false);
                    return { value: entityType, label: config.label };
                  }),
                ]}
              />
            </div>

            {/* User Role Filter */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                Rol de Usuario
              </Label>
              <SimpleSelect
                value={localFilters.user_role || 'all'}
                onValueChange={(value) => updateLocalFilter('user_role', value)}
                placeholder="Seleccionar rol"
                options={[
                  { value: 'all', label: 'Todos los roles' },
                  { value: 'admin', label: 'Admin' },
                  { value: 'user', label: 'User' },
                  { value: 'guest', label: 'Guest' },
                ]}
              />
            </div>

            {/* Start Date */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                Fecha Inicio
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal h-11 transition-all duration-200 hover:border-gray-400 hover:shadow-sm',
                      !localFilters.start_date && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.start_date
                      ? formatDate(new Date(localFilters.start_date))
                      : 'Fecha inicio'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      localFilters.start_date
                        ? new Date(localFilters.start_date)
                        : undefined
                    }
                    onSelect={(date) =>
                      updateLocalFilter(
                        'start_date',
                        date?.toISOString().split('T')[0],
                      )
                    }
                    disabled={(date) => date > new Date()}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                Fecha Fin
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal h-11 transition-all duration-200 hover:border-gray-400 hover:shadow-sm',
                      !localFilters.end_date && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.end_date
                      ? formatDate(new Date(localFilters.end_date))
                      : 'Fecha fin'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      localFilters.end_date
                        ? new Date(localFilters.end_date)
                        : undefined
                    }
                    onSelect={(date) =>
                      updateLocalFilter(
                        'end_date',
                        date?.toISOString().split('T')[0],
                      )
                    }
                    disabled={(date) => {
                      const today = new Date();
                      const startDate = localFilters.start_date
                        ? new Date(localFilters.start_date)
                        : null;
                      return (
                        date > today || (startDate ? date < startDate : false)
                      );
                    }}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between pt-8 border-t mt-6">
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={activeFiltersCount === 0}
            className="text-gray-600 h-11 px-6 transition-all duration-200 hover:bg-black hover:text-white hover:border-black hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Limpiar Filtros
          </Button>
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="h-11 px-6 transition-all duration-200 hover:bg-black hover:text-white hover:border-black hover:shadow-md active:scale-95"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleApply}
              className="bg-black hover:bg-black hover:text-white text-white h-11 px-6 transition-all duration-200 hover:shadow-lg active:scale-95"
            >
              Aplicar Filtros
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ErrorLogFiltersModal;
