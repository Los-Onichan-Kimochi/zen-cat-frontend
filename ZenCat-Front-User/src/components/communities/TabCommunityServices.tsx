import { useState, useMemo } from 'react';
import { Service } from '@/types/service';
import { Community } from './CommunityCard';
import { CommunityServiceCard } from './CommunityServiceCard';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { SearchInput } from '@/components/communities/SearchInput';
import { FilterControls } from '@/components/communities/FilterControls';

interface TabCommunityServicesProps {
  community: Community | null;
  services: Service[] | null;
}

export function TabCommunityServices({ community, services =[] }: TabCommunityServicesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(3);
  const safeServices = Array.isArray(services) ? services : [];

  // Filtrar servicios por búsqueda
  const filteredServices = useMemo(() => {
    // Aseguramos que services nunca sea null o undefined
    const filtered = [...safeServices];
    // Filtrar por búsqueda
    const filteredBySearch = filtered.filter((service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Ordenar servicios
    filteredBySearch.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filteredBySearch;
  }, [services, searchTerm, sortBy]);

  // Paginación
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentServices = filteredServices.slice(startIndex, endIndex);

  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  const handlePrevious = () => {
    if (canGoPrevious) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (!services || services.length === 0) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm py-6">
        <div className="text-center">
          <h1 className="text-4xl font-black">¡No hay servicios disponibles!</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm py-6">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-black">¡Busca el servicio que más te guste!</h1>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar servicio..."
          className="w-full sm:w-80"
        />
        <FilterControls
          sortBy={sortBy}
          onSortChange={setSortBy}
          showFilter={false}
        />
      </div>
      
      {/* Resultados */}
      <div className="text-center text-sm text-gray-600 mb-2">
        Resultados: {filteredServices.length} servicios
      </div>
        
      {/* Mostrar servicios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-8">
        {currentServices.map((service) => (
          <CommunityServiceCard
            key={service.id}
            community={community!}
            service={service}
            onAction={(communityId, action) => console.log(`Acción: ${action} en la comunidad ${communityId}`)}
          />
        ))}
      </div>

      {/* Paginación */}
      <div className="flex justify-center mt-6">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <button 
                onClick={handlePrevious} 
                disabled={!canGoPrevious}
                className="px-2 py-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
              >
                Anterior
              </button>
            </PaginationItem>
            
            {Array.from({ length: totalPages }).map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(index);
                  }}
                  isActive={currentPage === index}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <button 
                onClick={handleNext} 
                disabled={!canGoNext}
                className="px-2 py-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
              >
                Siguiente
              </button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
