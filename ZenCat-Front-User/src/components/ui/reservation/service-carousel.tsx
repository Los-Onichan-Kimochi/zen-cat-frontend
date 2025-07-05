import { SelectableCard } from '@/components/ui/selectable-card';
import { TablePagination } from '@/components/common/TablePagination';

type Service = {
  title: string;
  description: string;
  imageUrl: string;
};

type Props = {
  services: Service[];
  onSelect: (title: string) => void;
  selected?: string | null;
  // Props para paginación
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function ServiceCarousel({ 
  services, 
  onSelect, 
  selected,
  currentPage,
  totalPages,
  onPageChange 
}: Props) {
  return (
    <div className="w-full space-y-4">
      {/* Grid de servicios mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {services.map((service) => (
          <div key={service.title} className="h-full">
            <SelectableCard
              title={service.title}
              description={service.description}
              imageUrl={service.imageUrl}
              selected={selected === service.title}
              onClick={() => onSelect(service.title)}
            />
          </div>
        ))}
      </div>

      {/* Mensaje cuando no hay servicios */}
      {services.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-lg font-medium">
            No hay servicios disponibles
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Intenta ajustar tus filtros de búsqueda
          </p>
        </div>
      )}

      {/* Paginación integrada */}
      <div className="flex justify-center">
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
