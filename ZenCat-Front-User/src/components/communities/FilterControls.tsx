import { Select, SelectItem } from '@/components/ui/select';

interface FilterControlsProps {
  sortBy: string;
  filterBy?: string;
  onSortChange: (value: string) => void;
  onFilterChange?: (value: string) => void;
  showFilter?: boolean; // Nueva propiedad para controlar la visibilidad del filtro
}

export function FilterControls({
  sortBy,
  filterBy,
  onSortChange,
  onFilterChange,
  showFilter = true,
}: FilterControlsProps) {
  return (
    <div className="flex gap-4">
      {/* Mostrar solo "Ordenar por" */}
      <div className="w-48">
        <Select
          value={sortBy}
          onValueChange={onSortChange}
          placeholder="Ordenar por"
        >
          <SelectItem value="name">Nombre</SelectItem>
          <SelectItem value="status">Estado</SelectItem>
          <SelectItem value="date">Fecha</SelectItem>
        </Select>
      </div>

      {/* Mostrar "Filtrar por" solo si showFilter es true */}
      {showFilter && (
        <div className="w-48">
          <Select
            value={filterBy}
            onValueChange={onFilterChange}
            placeholder="Filtrar por"
          >
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="active">Activas</SelectItem>
            <SelectItem value="suspended">Suspendidas</SelectItem>
            <SelectItem value="expired">Vencidas</SelectItem>
          </Select>
        </div>
      )}
    </div>
  );
}
