import React from 'react';
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

interface AuditFiltersProps {
  filters: AuditLogFilters;
  onFiltersChange: (filters: AuditLogFilters) => void;
  onClearFilters: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function AuditFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  isCollapsed,
  onToggleCollapse,
}: AuditFiltersProps) {
  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== '' && value !== null
  ).length;

  const updateFilter = (key: keyof AuditLogFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' || value === 'all' ? undefined : value,
    });
  };

  const formatDate = (date: Date | undefined) =>
    date ? format(date, 'dd/MM/yyyy', { locale: es }) : 'Seleccionar fecha';

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros Avanzados</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro' : 'filtros'}
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="text-gray-600 hover:text-gray-800"
          >
            {isCollapsed ? 'Mostrar' : 'Ocultar'}
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* User Search */}
          <div className="space-y-2">
            <Label htmlFor="user-search" className="text-sm font-medium">
              Buscar Usuario
            </Label>
            <Input
              id="user-search"
              placeholder="Email o nombre..."
              value={filters.user_search || ''}
              onChange={(e) => updateFilter('user_search', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Action Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tipo de Acción</Label>
                       <Select
             value={filters.action || 'all'}
             onValueChange={(value) => updateFilter('action', value)}
           >
             <SelectTrigger>
               <SelectValue placeholder="Seleccionar acción" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">Todas las acciones</SelectItem>
                {Object.entries(ACTION_CONFIGS).map(([action, config]) => (
                  <SelectItem key={action} value={action}>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${config.className} text-xs px-2 py-0`}>
                        {config.label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Entity Type Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tipo de Entidad</Label>
                       <Select
             value={filters.entity_type || 'all'}
             onValueChange={(value) => updateFilter('entity_type', value)}
           >
             <SelectTrigger>
               <SelectValue placeholder="Seleccionar entidad" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">Todas las entidades</SelectItem>
                {Object.entries(ENTITY_CONFIGS).map(([entity, config]) => (
                  <SelectItem key={entity} value={entity}>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${config.className} text-xs px-2 py-0`}>
                        {config.label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* User Role Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Rol de Usuario</Label>
                       <Select
             value={filters.user_role || 'all'}
             onValueChange={(value) => updateFilter('user_role', value)}
           >
             <SelectTrigger>
               <SelectValue placeholder="Seleccionar rol" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="admin">
                  <Badge className="bg-red-50 text-red-700 border-red-200 text-xs px-2 py-0">
                    Admin
                  </Badge>
                </SelectItem>
                <SelectItem value="user">
                  <Badge className="bg-gray-50 text-gray-700 border-gray-200 text-xs px-2 py-0">
                    User
                  </Badge>
                </SelectItem>
                <SelectItem value="guest">
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-0">
                    Guest
                  </Badge>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Success Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Estado</Label>
                       <Select
             value={filters.success?.toString() || 'all'}
             onValueChange={(value) => updateFilter('success', value === 'all' ? undefined : value === 'true')}
           >
             <SelectTrigger>
               <SelectValue placeholder="Seleccionar estado" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="true">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Exitoso</span>
                  </div>
                </SelectItem>
                <SelectItem value="false">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Con errores</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Fecha Inicio</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.start_date 
                    ? formatDate(new Date(filters.start_date))
                    : 'Fecha inicio'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.start_date ? new Date(filters.start_date) : undefined}
                  onSelect={(date) => updateFilter('start_date', date?.toISOString().split('T')[0])}
                  locale={es}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Fecha Fin</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.end_date 
                    ? formatDate(new Date(filters.end_date))
                    : 'Fecha fin'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.end_date ? new Date(filters.end_date) : undefined}
                  onSelect={(date) => updateFilter('end_date', date?.toISOString().split('T')[0])}
                  locale={es}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
    </div>
  );
} 