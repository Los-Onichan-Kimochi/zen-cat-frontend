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
import { ProfessionalFilters } from './filters';
import { ProfessionalSpecialty, ProfessionalType } from '@/types/professional';

interface ProfessionalFiltersModalProps {
  open: boolean;
  onClose: () => void;
  filters: ProfessionalFilters;
  onApplyFilters: (filters: ProfessionalFilters) => void;
  onClearFilters: () => void;
}

export const ProfessionalFiltersModal = React.memo(function ProfessionalFiltersModal({
  open,
  onClose,
  filters,
  onApplyFilters,
  onClearFilters,
}: ProfessionalFiltersModalProps) {
  const [localFilters, setLocalFilters] = useState<ProfessionalFilters>(filters);

  const handleInputChange = useCallback((key: keyof ProfessionalFilters, value: string | ProfessionalSpecialty | ProfessionalType) => {
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
      delete newFilters[key as keyof ProfessionalFilters];
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
            Filtros de Profesionales
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
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              type="text"
              placeholder="Buscar por nombre..."
              value={localFilters.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Buscar por email..."
              value={localFilters.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="phone_number">Teléfono</Label>
            <Input
              id="phone_number"
              type="text"
              placeholder="Buscar por teléfono..."
              value={localFilters.phone_number || ''}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Especialidad */}
          <div className="space-y-2">
            <Label htmlFor="specialty">Especialidad</Label>
            <Select 
              value={localFilters.specialty || 'all'} 
              onValueChange={(value) => handleInputChange('specialty', value === 'all' ? undefined : value as ProfessionalSpecialty)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar especialidad..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las especialidades</SelectItem>
                <SelectItem value={ProfessionalSpecialty.YOGA_TEACHER}>Profesor de Yoga</SelectItem>
                <SelectItem value={ProfessionalSpecialty.GYM_TEACHER}>Profesor de Gimnasio</SelectItem>
                <SelectItem value={ProfessionalSpecialty.DOCTOR}>Médico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select 
              value={localFilters.type || 'all'} 
              onValueChange={(value) => handleInputChange('type', value === 'all' ? undefined : value as ProfessionalType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value={ProfessionalType.MEDIC}>Médico</SelectItem>
                <SelectItem value={ProfessionalType.GYM_TRAINER}>Entrenador de Gimnasio</SelectItem>
                <SelectItem value={ProfessionalType.YOGA_TRAINER}>Entrenador de Yoga</SelectItem>
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
                      {key === 'email' && `Email: ${value}`}
                      {key === 'phone_number' && `Teléfono: ${value}`}
                      {key === 'specialty' && `Especialidad: ${value}`}
                      {key === 'type' && `Tipo: ${value}`}
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