import {
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { ReservaServiciosRoute } from '@/layouts/reservation-layout';
import { ServiceCarousel } from '@/components/ui/reservation/service-carousel';
import { Button } from '@/components/ui/button';
import { Select, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search } from 'lucide-react';
import { communityServicesApi } from '@/api/communities/community-services';
import { servicesApi } from '@/api/services/services';
import { Service } from '@/types/service';
import { CommunityService } from '@/types/community-service';
import { useReservation } from '@/context/reservation-context';
import { useEffect, useMemo, useState } from 'react';

export const Route = createFileRoute(ReservaServiciosRoute)({
  component: ServiceStepComponent,
  validateSearch: z.object({
    servicio: z.string().optional(), // Permite pasar un query param `servicio`
    communityId: z.string().optional(), // Permite pasar el ID de la comunidad
    membershipId: z.string().optional(), // Permite pasar el ID de la membresía
  }),
});

function ServiceStepComponent() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/reserva/servicios' });
  const { reservationData, updateReservation } = useReservation();
  
  // Estados para búsqueda, ordenamiento y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(3);

  const selected = search.servicio ?? null;

  // Usar el communityId del search param si está disponible, sino usar el del contexto
  const communityId = search.communityId || reservationData.communityId;
  const membershipId = search.membershipId || reservationData.membershipId;

  // Actualizar el contexto con el communityId y membershipId si vienen del search param
  useEffect(() => {
    const updates: Partial<any> = {};
    
    if (search.communityId && search.communityId !== reservationData.communityId) {
      updates.communityId = search.communityId;
    }
    
    if (search.membershipId && search.membershipId !== reservationData.membershipId) {
      updates.membershipId = search.membershipId;
    }
    
    if (Object.keys(updates).length > 0) {
      updateReservation(updates);
    }
  }, [search.communityId, search.membershipId, reservationData.communityId, reservationData.membershipId, updateReservation]);

  // Si no hay communityId, mostrar mensaje de error
  if (!communityId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No se ha seleccionado una comunidad
          </h2>
          <p className="text-gray-600 mb-6">
            Para ver los servicios disponibles, primero debes seleccionar una
            comunidad desde "Mis comunidades".
          </p>
          <Button
            onClick={() => navigate({ to: '/mis-comunidades' })}
            className="bg-black text-white hover:bg-gray-800"
          >
            Ir a Mis Comunidades
          </Button>
        </div>
      </div>
    );
  }

  // Función para manejar la selección de un servicio
  const handleSelect = (serviceName: string) => {
    navigate({
      to: ReservaServiciosRoute,
      search: { servicio: serviceName }, // actualiza el query param `?servicio=...`
      replace: true, // evitar que se agregue a la historia del navegador
    });
  };

  // Obtener los servicios de la comunidad
  const {
    data: communityServicesData = [],
    isLoading: isLoadingCommunityServices,
    error: errorCommunityServices,
  } = useQuery<CommunityService[], Error>({
    queryKey: ['communityServices', communityId],
    queryFn: () =>
      communityServicesApi.getCommunityServicesByCommunityId(communityId!),
  });

  const {
    data: servicesData = [],
    isLoading: isLoadingServices,
    error: errorServices,
  } = useQuery<Service[], Error>({
    queryKey: ['services'],
    queryFn: servicesApi.getServices,
  });

  // Filtrar servicios que pertenecen a la comunidad usando useMemo para optimizar
  const allServices: Service[] = useMemo(() => {
    if (!servicesData.length || !communityServicesData.length) return [];

    const filtered = servicesData
      .map((service) => {
        const match = communityServicesData.find(
          (cs) => cs.service_id === service.id,
        );
        if (!match) return null;
        return {
          id: service.id,
          name: service.name,
          description: service.description,
          image_url: service.image_url,
          is_virtual: service.is_virtual,
        };
      })
      .filter((s): s is Service => s !== null);

    return filtered;
  }, [servicesData, communityServicesData, communityId]);

  // Filtrar y ordenar servicios
  const filteredAndSortedServices = useMemo(() => {
    let filtered = [...allServices];

    // Aplicar filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter((service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar ordenamiento
    if (sortBy) {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'a-z':
            return a.name.localeCompare(b.name);
          case 'z-a':
            return b.name.localeCompare(a.name);
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [allServices, searchTerm, sortBy]);

  // Paginación
  const totalPages = Math.ceil(filteredAndSortedServices.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentServices = filteredAndSortedServices.slice(startIndex, endIndex);

  // Reset página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, sortBy]);

  // Actualizar el contexto cuando se selecciona un servicio
  useEffect(() => {
    if (selected && allServices.length > 0) {
      const selectedService = allServices.find((s) => s.name === selected);
      if (selectedService) {
        updateReservation({
          service: {
            id: selectedService.id,
            name: selectedService.name,
            description: selectedService.description,
            image_url: selectedService.image_url,
            is_virtual: selectedService.is_virtual,
          },
        });
      }
    }
  }, [selected, allServices.length, updateReservation]);

  if (isLoadingCommunityServices || isLoadingServices || !communityId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin w-12 h-12" />
      </div>
    );
  }

  if (errorCommunityServices || errorServices) {
    return (
      <div>
        Error cargando los servicios. {errorCommunityServices?.message}
        {errorServices?.message}
      </div>
    );
  }

  const handleContinue = () => {
    if (selected && reservationData.service) {
      navigate({
        to: '/reserva/location-professional',
        search: { 
          servicio: selected,
          communityId: communityId,
          membershipId: membershipId,
          serviceId: reservationData.service.id,
        },
      });
    }
  };

  return (
    <div>
      <div className="border p-6 rounded-md min-h-[430px] w-full">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-6">
            {/* Título mejorado */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                ¡Busca el servicio que más te guste!
              </h1>
              <p className="text-gray-600 text-lg">
                Explora nuestra variedad de servicios y encuentra el perfecto para ti
              </p>
            </div>

            {/* Barra de búsqueda y ordenamiento */}
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <div className="relative w-full md:w-1/2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar servicio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-full md:w-1/4">
                <Select
                  value={sortBy}
                  onValueChange={setSortBy}
                  placeholder="Ordenar por"
                >
                  <SelectItem value="">Sin ordenar</SelectItem>
                  <SelectItem value="a-z">A-Z</SelectItem>
                  <SelectItem value="z-a">Z-A</SelectItem>
                </Select>
              </div>
            </div>

            {/* Contador de resultados */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Resultados: {filteredAndSortedServices.length} servicios
                {searchTerm && ` encontrados para "${searchTerm}"`}
              </p>
            </div>

            {/* Leyenda de tipos de servicio */}
            <div className="flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium">Virtual</span>
                </div>
                <span className="text-gray-600">Sesión online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium">Presencial</span>
                </div>
                <span className="text-gray-600">Sesión en persona</span>
              </div>
            </div>

            {/* ServiceCarousel con paginación integrada */}
            <ServiceCarousel
              services={currentServices.map((s) => ({
                id: s.id,
                name: s.name,
                description: s.description,
                image_url: s.image_url,
                is_virtual: s.is_virtual,
              }))}
              selected={selected}
              onSelect={handleSelect}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between mt-6">
        <Button
          onClick={() => navigate({ to: '/mis-comunidades' })}
          className="px-8 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-gray-100"
        >
          Atrás
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selected || !reservationData.service}
          className="px-8 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-300"
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
