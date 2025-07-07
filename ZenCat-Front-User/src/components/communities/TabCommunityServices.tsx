import { useState, useMemo } from 'react';
import { Service } from '@/types/service';
import { Community } from './CommunityCard';
import { CommunityServiceCard } from './CommunityServiceCard';
import { SearchInput } from '@/components/communities/SearchInput';
import { FilterControls } from '@/components/communities/FilterControls';
import { useNavigate } from '@tanstack/react-router';
import { TablePagination } from '@/components/common/TablePagination';
import { useReservationAlert } from '@/components/ui/ReservationAlert';

interface TabCommunityServicesProps {
  community: Community | null;
  services: Service[] | null;
}

export function TabCommunityServices({
  community,
  services = [],
}: TabCommunityServicesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(3);
  const navigate = useNavigate();
  const { error: showErrorAlert, AlertComponent } = useReservationAlert();
  const safeServices = Array.isArray(services) ? services : [];

  // Filtrar servicios por búsqueda
  const filteredServices = useMemo(() => {
    // Aseguramos que services nunca sea null o undefined
    const filtered = [...safeServices];
    // Filtrar por búsqueda
    const filteredBySearch = filtered.filter((service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Ordenar servicios
    filteredBySearch.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        default:
          comparison = 0;
      }
      
      // Aplicar dirección de ordenamiento
      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return filteredBySearch;
  }, [services, searchTerm, sortBy, sortDirection]);

  // Paginación
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentServices = filteredServices.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleServiceReservation = (communityId: string, serviceId: string) => {
    if (!community) return;

    // 🔍 VALIDACIÓN DE RESERVAS DISPONIBLES (igual que en TabCommunityGeneral)
    const reservasDisponibles = community.reservationsUsed === null 
      ? null // Sin límite
      : (community.reservationLimit || 0) - (community.reservationsUsed || 0);

    // Verificar si hay reservas disponibles
    if (reservasDisponibles !== null && reservasDisponibles <= 0) {
      showErrorAlert('No tienes reservas disponibles en tu plan actual');
      return;
    }

    // Encontrar el servicio seleccionado
    const selectedService = safeServices.find(
      (service) => service.id === serviceId,
    );

    if (selectedService) {
      // Navegar directamente al paso 2 (selección de lugar) pasando communityId, membershipId y servicio
      // El contexto de reservación se actualizará automáticamente en la ruta destino
      navigate({
        to: '/reserva/location-professional',
        search: {
          communityId: communityId,
          membershipId: community.membershipId,
          servicio: selectedService.name,
          serviceId: selectedService.id,
        },
      });
    }
  };

  if (!services || services.length === 0) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm py-6">
        <div className="text-center">
          <h1 className="text-4xl font-black">
            ¡No hay servicios disponibles!
          </h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm py-6">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-black">
            ¡Busca el servicio que más te guste!
          </h1>
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
            sortDirection={sortDirection}
            onSortChange={setSortBy}
            onSortDirectionChange={setSortDirection}
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
              onAction={(communityId, action) => {
                if (action === 'reserve') {
                  handleServiceReservation(communityId, service.id);
                }
              }}
            />
          ))}
        </div>

        {/* Paginación */}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
      
      {/* Componente de Alerta personalizado */}
      <AlertComponent />
    </>
  );
}
