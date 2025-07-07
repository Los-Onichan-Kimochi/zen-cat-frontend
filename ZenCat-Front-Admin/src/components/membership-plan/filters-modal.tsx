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
import { MembershipPlanFilters } from './filters';
import { MembershipPlanType } from '@/types/membership-plan';

interface MembershipPlanFiltersModalProps {
  open: boolean;
  onClose: () => void;
  filters: MembershipPlanFilters;
  onApplyFilters: (filters: MembershipPlanFilters) => void;
  onClearFilters: () => void;
}

export const MembershipPlanFiltersModal = React.memo(function MembershipPlanFiltersModal({
  open,
  onClose,
  filters,
  onApplyFilters,
  onClearFilters,
}: MembershipPlanFiltersModalProps) {
  const [localFilters, setLocalFilters] = useState<MembershipPlanFilters>(filters);

  const handleInputChange = useCallback((key: keyof MembershipPlanFilters, value: string | MembershipPlanType) => {
    setLocalFilters(prev => {
      const newFilters = { ...prev };
      
      if (key === 'min_fee' || key === 'max_fee' || key === 'min_reservation_limit' || key === 'max_reservation_limit') {
        // Para números, permitir valores vacíos o números válidos
        if (value === '' || value === null || value === undefined) {
          delete newFilters[key];
        } else {
          const numValue = parseFloat(value as string);
          if (!isNaN(numValue) && numValue >= 0) {
            newFilters[key] = numValue;
          }
        }
      } else {
        // Para tipo y otros campos
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
      delete newFilters[key as keyof MembershipPlanFilters];
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
            Filtros de Planes de Membresía
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} activo{activeFiltersCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tipo de membresía */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Membresía</Label>
            <Select 
              value={localFilters.type || 'all'} 
              onValueChange={(value) => handleInputChange('type', value === 'all' ? undefined : value as MembershipPlanType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value={MembershipPlanType.MONTHLY}>Mensual</SelectItem>
                <SelectItem value={MembershipPlanType.ANUAL}>Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Precio */}
          <div className="space-y-2">
            <Label>Precio (S/)</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Min"
                  value={localFilters.min_fee || ''}
                  onChange={(e) => handleInputChange('min_fee', e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full"
                />
              </div>
              <span className="text-sm text-gray-500">a</span>
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Max"
                  value={localFilters.max_fee || ''}
                  onChange={(e) => handleInputChange('max_fee', e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Límite de reservas */}
          <div className="space-y-2">
            <Label>Límite de Reservas</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Min"
                  value={localFilters.min_reservation_limit || ''}
                  onChange={(e) => handleInputChange('min_reservation_limit', e.target.value)}
                  min="0"
                  className="w-full"
                />
              </div>
              <span className="text-sm text-gray-500">a</span>
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Max"
                  value={localFilters.max_reservation_limit || ''}
                  onChange={(e) => handleInputChange('max_reservation_limit', e.target.value)}
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
                      {key === 'type' && `Tipo: ${value}`}
                      {key === 'min_fee' && `Min. precio: S/ ${value}`}
                      {key === 'max_fee' && `Max. precio: S/ ${value}`}
                      {key === 'min_reservation_limit' && `Min. límite reservas: ${value}`}
                      {key === 'max_reservation_limit' && `Max. límite reservas: ${value}`}
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