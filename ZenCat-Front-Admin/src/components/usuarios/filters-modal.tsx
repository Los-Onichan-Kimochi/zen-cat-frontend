import React, { useEffect, useMemo, useState } from 'react';
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
import { Filter } from 'lucide-react';

export interface UsersFilters {
  search?: string;
  phone?: string;
  document?: string;
  district?: string;
}

interface UsersFiltersModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  filters: UsersFilters;
  onFiltersChange: (filters: UsersFilters) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
}

export function UsersFiltersModal({
  isOpen,
  open,
  onClose,
  filters,
  onFiltersChange,
  onClearFilters,
  onApplyFilters,
}: UsersFiltersModalProps) {
  const [localFilters, setLocalFilters] = useState<UsersFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const activeFiltersCount = useMemo(() => {
    return Object.values(localFilters).filter((v) => v && v.trim() !== '').length;
  }, [localFilters]);

  const updateLocalFilter = (key: keyof UsersFilters, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApplyFilters();
  };

  const handleClear = () => {
    setLocalFilters({});
    onClearFilters();
  };

  const modalOpen = isOpen !== undefined ? isOpen : open || false;
  return (
    <Dialog open={modalOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter size={20} /> Filtros de Usuarios
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} activo{activeFiltersCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Búsqueda */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="search" className="text-right">
              Buscar
            </Label>
            <Input
              id="search"
              placeholder="Nombre o correo..."
              value={localFilters.search || ''}
              onChange={(e) => updateLocalFilter('search', e.target.value)}
              className="col-span-3"
            />
          </div>

          {/* Celular */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Celular
            </Label>
            <Input
              id="phone"
              placeholder="Ej. 987654321"
              value={localFilters.phone || ''}
              onChange={(e) => updateLocalFilter('phone', e.target.value)}
              className="col-span-3"
            />
          </div>

          {/* Documento */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="document" className="text-right">
              Documento
            </Label>
            <Input
              id="document"
              placeholder="Número documento"
              value={localFilters.document || ''}
              onChange={(e) => updateLocalFilter('document', e.target.value)}
              className="col-span-3"
            />
          </div>

          {/* Distrito */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="district" className="text-right">
              Distrito
            </Label>
            <Input
              id="district"
              placeholder="Ej. Miraflores"
              value={localFilters.district || ''}
              onChange={(e) => updateLocalFilter('district', e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClear}>
            Limpiar
          </Button>
          <Button variant="default" onClick={handleApply}>
            Aplicar filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Compatibilidad: exportar alias con el nombre anterior
export const UserFiltersModal = UsersFiltersModal; 