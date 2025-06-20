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
import { AuditLogFilters, ACTION_CONFIGS, ENTITY_CONFIGS, AuditAction, AuditEntityType } from '@/types/audit';

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AuditLogFilters;
  onFiltersChange: (filters: AuditLogFilters) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
}

// Pre-calcular opciones para evitar recálculos en cada render
const ACTION_OPTIONS = Object.entries(ACTION_CONFIGS).map(([key, config]) => ({
  value: key as AuditAction,
  label: config.label,
  color: config.color,
}));

const ENTITY_OPTIONS = Object.entries(ENTITY_CONFIGS).map(([key, config]) => ({
  value: key as AuditEntityType,
  label: config.label,
  color: config.color,
}));

const USER_ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrador' },
  { value: 'user', label: 'Usuario' },
  { value: 'guest', label: 'Invitado' },
];

// Simple select component that doesn't use portals or complex focus management
function SimpleSelect({ 
  value, 
  onValueChange, 
  placeholder, 
  options,
  className 
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: Array<{ value: string; label: string; color?: string }>;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={cn(
        "w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none",
        className
      )}
    >
      <option value="" disabled hidden>{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function AuditFiltersModal({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onClearFilters,
  onApplyFilters,
}: FiltersModalProps) {
  const [localFilters, setLocalFilters] = useState<AuditLogFilters>(filters);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // Sincronizar filtros locales cuando cambien los filtros externos
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Cleanup: Close popovers when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStartDateOpen(false);
      setEndDateOpen(false);
    }
  }, [isOpen]);

  // Memoizar contador de filtros activos
  const activeFiltersCount = useMemo(() => {
    return Object.entries(localFilters).filter(([key, value]) => 
      key !== 'page' && key !== 'limit' && value !== undefined && value !== ''
    ).length;
  }, [localFilters]);

  const updateLocalFilter = useCallback((key: keyof AuditLogFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

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
  }, [localFilters, onFiltersChange, onApplyFilters]);

  const formatDate = useCallback((date: Date) => {
    return format(date, 'yyyy-MM-dd');
  }, []);

  // Check if any component that creates a focus scope is open
  const hasOpenFocusScope = startDateOpen || endDateOpen;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter size={20} />
              Filtros de Auditoría
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} activo{activeFiltersCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Búsqueda de Usuario */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="user_search" className="text-right">
                Usuario
              </Label>
              <Input
                id="user_search"
                placeholder="Buscar por email o ID..."
                value={localFilters.user_search || ''}
                onChange={(e) => updateLocalFilter('user_search', e.target.value)}
                className="col-span-3"
              />
            </div>

            {/* Acción */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="action" className="text-right">
                Acción
              </Label>
                          <div className="col-span-3">
              <SimpleSelect
                value={localFilters.action || 'all_actions'}
                onValueChange={(value) => updateLocalFilter('action', value === 'all_actions' ? undefined : value)}
                placeholder="Seleccionar acción..."
                options={[
                  { value: 'all_actions', label: 'Todas las acciones' },
                  ...ACTION_OPTIONS
                ]}
              />
            </div>
            </div>

            {/* Tipo de Entidad */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="entity_type" className="text-right">
                Entidad
              </Label>
                          <div className="col-span-3">
              <SimpleSelect
                value={localFilters.entity_type || 'all_entities'}
                onValueChange={(value) => updateLocalFilter('entity_type', value === 'all_entities' ? undefined : value)}
                placeholder="Seleccionar entidad..."
                options={[
                  { value: 'all_entities', label: 'Todas las entidades' },
                  ...ENTITY_OPTIONS
                ]}
              />
            </div>
            </div>

            {/* Rol de Usuario */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="user_role" className="text-right">
                Rol
              </Label>
                          <div className="col-span-3">
              <SimpleSelect
                value={localFilters.user_role || 'all_roles'}
                onValueChange={(value) => updateLocalFilter('user_role', value === 'all_roles' ? undefined : value)}
                placeholder="Seleccionar rol..."
                options={[
                  { value: 'all_roles', label: 'Todos los roles' },
                  ...USER_ROLE_OPTIONS
                ]}
              />
            </div>
            </div>

            {/* Fecha de Inicio */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Desde</Label>
              <div className="col-span-3">
                <Popover open={startDateOpen && isOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !localFilters.start_date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.start_date ? (
                        format(new Date(localFilters.start_date), 'PPP', { locale: es })
                      ) : (
                        'Fecha inicio'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={localFilters.start_date ? new Date(localFilters.start_date) : undefined}
                      onSelect={(date) => {
                        updateLocalFilter('start_date', date ? formatDate(date) : undefined);
                        setStartDateOpen(false);
                      }}
                      disabled={(date) => date > new Date()}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Fecha de Fin */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Hasta</Label>
              <div className="col-span-3">
                <Popover open={endDateOpen && isOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !localFilters.end_date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.end_date ? (
                        format(new Date(localFilters.end_date), 'PPP', { locale: es })
                      ) : (
                        'Fecha fin'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={localFilters.end_date ? new Date(localFilters.end_date) : undefined}
                      onSelect={(date) => {
                        updateLocalFilter('end_date', date ? formatDate(date) : undefined);
                        setEndDateOpen(false);
                      }}
                      disabled={(date) => {
                        const minDate = localFilters.start_date ? new Date(localFilters.start_date) : undefined;
                        return date > new Date() || (minDate && date < minDate);
                      }}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              className="transition-all duration-200 hover:bg-black hover:text-white hover:border-black"
            >
              Limpiar Filtros
            </Button>
            <Button 
              onClick={handleApplyFilters}
              className="transition-all duration-200 hover:bg-black hover:text-white"
            >
              Aplicar Filtros
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  } 