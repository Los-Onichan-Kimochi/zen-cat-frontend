import React, { useState } from 'react';
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
import { CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AuditLogFilters, ACTION_CONFIGS, ENTITY_CONFIGS } from '@/types/audit';

interface AuditFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AuditLogFilters;
  onFiltersChange: (filters: AuditLogFilters) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
}

export function AuditFiltersModal({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onClearFilters,
  onApplyFilters,
}: AuditFiltersModalProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== '' && value !== null
  ).length - 2; // Exclude page and limit from count

  const updateFilter = (key: keyof AuditLogFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' || value === 'all' ? undefined : value,
    });
  };

  const formatDate = (date: Date | undefined) =>
    date ? format(date, 'dd/MM/yyyy', { locale: es }) : 'Seleccionar fecha';

  const handleApply = () => {
    onApplyFilters();
    onClose();
  };

  const handleClear = () => {
    onClearFilters();
  };

  const handleDropdownChange = (dropdownName: string, isOpen: boolean) => {
    if (isOpen) {
      setOpenDropdown(dropdownName);
    } else if (openDropdown === dropdownName) {
      setOpenDropdown(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl min-h-[50vh] max-h-[90vh] min-w-[50vw] overflow-y-auto font-montserrat animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader className="pb-8">
          <DialogTitle className="flex items-center space-x-3 text-xl">
            <Filter className="h-6 w-6 text-gray-600" />
            <span>Filtros Avanzados</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro' : 'filtros'}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {/* User Search */}
            <div className="space-y-4">
              <Label htmlFor="user-search" className="text-sm font-medium text-gray-700">
                Buscar Usuario
              </Label>
              <Input
                id="user-search"
                placeholder="Email o nombre..."
                value={filters.user_search || ''}
                onChange={(e) => updateFilter('user_search', e.target.value)}
                className="w-full h-11"
              />
            </div>

            {/* Action Filter */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">Tipo de Acción</Label>
              <Select
                value={filters.action || 'all'}
                onValueChange={(value) => updateFilter('action', value)}
                open={openDropdown === 'action'}
                onOpenChange={(isOpen) => handleDropdownChange('action', isOpen)}
              >
                <SelectTrigger className="h-11 transition-all duration-200 hover:border-gray-400 hover:shadow-sm">
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
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">Tipo de Entidad</Label>
              <Select
                value={filters.entity_type || 'all'}
                onValueChange={(value) => updateFilter('entity_type', value)}
                open={openDropdown === 'entity_type'}
                onOpenChange={(isOpen) => handleDropdownChange('entity_type', isOpen)}
              >
                <SelectTrigger className="h-11 transition-all duration-200 hover:border-gray-400 hover:shadow-sm">
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
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">Rol de Usuario</Label>
              <Select
                value={filters.user_role || 'all'}
                onValueChange={(value) => updateFilter('user_role', value)}
                open={openDropdown === 'user_role'}
                onOpenChange={(isOpen) => handleDropdownChange('user_role', isOpen)}
              >
                <SelectTrigger className="h-11 transition-all duration-200 hover:border-gray-400 hover:shadow-sm">
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
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">Estado</Label>
              <Select
                value={filters.success?.toString() || 'all'}
                onValueChange={(value) => updateFilter('success', value === 'all' ? undefined : value === 'true')}
                open={openDropdown === 'success'}
                onOpenChange={(isOpen) => handleDropdownChange('success', isOpen)}
              >
                <SelectTrigger className="h-11 transition-all duration-200 hover:border-gray-400 hover:shadow-sm">
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
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">Fecha Inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11 transition-all duration-200 hover:border-gray-400 hover:shadow-sm",
                      !filters.start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.start_date 
                      ? formatDate(new Date(filters.start_date))
                      : 'Seleccionar fecha inicio'
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
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">Fecha Fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11 transition-all duration-200 hover:border-gray-400 hover:shadow-sm",
                      !filters.end_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.end_date 
                      ? formatDate(new Date(filters.end_date))
                      : 'Seleccionar fecha fin'
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
                    disabled={(date) => {
                      const today = new Date();
                      const startDate = filters.start_date ? new Date(filters.start_date) : null;
                      return date > today || (startDate ? date < startDate : false);
                    }}
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
            className="text-gray-600 h-11 px-6 transition-all duration-200 hover:shadow-md hover:border-gray-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Limpiar Filtros
          </Button>
          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="h-11 px-6 transition-all duration-200 hover:shadow-md hover:border-gray-400 active:scale-95"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleApply} 
              className="bg-black hover:bg-gray-800 text-white h-11 px-6 transition-all duration-200 hover:shadow-lg active:scale-95"
            >
              Aplicar Filtros
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 