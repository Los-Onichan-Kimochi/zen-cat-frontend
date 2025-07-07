import { ChevronDown, ArrowUpDown, ChevronUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface FilterControlsProps {
  sortBy: string;
  sortDirection?: 'asc' | 'desc';
  filterBy?: string;
  onSortChange: (value: string) => void;
  onSortDirectionChange?: (direction: 'asc' | 'desc') => void;
  onFilterChange?: (value: string) => void;
  showFilter?: boolean;
}

export function FilterControls({
  sortBy,
  sortDirection = 'asc',
  filterBy,
  onSortChange,
  onSortDirectionChange,
  onFilterChange,
  showFilter = true,
}: FilterControlsProps) {
  const sortOptions = [
    { value: 'name', label: 'Nombre' },
    { value: 'status', label: 'Estado' },
  ];

  const filterOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'active', label: 'Activas' },
    { value: 'suspended', label: 'Suspendidas' },
    { value: 'expired', label: 'Vencidas' },
    { value: 'cancelled', label: 'Canceladas' },
  ];

  const currentSortLabel = sortOptions.find(option => option.value === sortBy)?.label || 'Nombre';
  const currentFilterLabel = filterOptions.find(option => option.value === filterBy)?.label || 'Todas';

  const handleSortOptionClick = (value: string) => {
    if (sortBy === value) {
      // Si es la misma opción, cambiar dirección
      if (onSortDirectionChange) {
        onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc');
      }
    } else {
      // Si es diferente opción, cambiar el campo y resetear a ascendente
      onSortChange(value);
      if (onSortDirectionChange) {
        onSortDirectionChange('asc');
      }
    }
  };

  return (
    <div className="flex gap-4">
      {/* Ordenar por */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-48 justify-between text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white"
          >
            Ordenar por: {currentSortLabel}
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          {sortOptions.map((option, index) => (
            <div key={option.value}>
              <DropdownMenuItem
                onClick={() => handleSortOptionClick(option.value)}
                className={`flex items-center justify-between ${sortBy === option.value ? 'bg-gray-100' : ''}`}
              >
                <span>{option.label}</span>
                {sortBy === option.value && (
                  sortDirection === 'asc' ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                )}
              </DropdownMenuItem>
              {index < sortOptions.length - 1 && <DropdownMenuSeparator />}
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Filtrar por */}
      {showFilter && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-48 justify-between text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white"
            >
              Filtrar por: {currentFilterLabel}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            {filterOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onFilterChange?.(option.value)}
                className={filterBy === option.value ? 'bg-gray-100' : ''}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
