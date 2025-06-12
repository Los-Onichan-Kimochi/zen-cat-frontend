import {
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { ReservaServiciosRoute } from '@/layouts/reservation-layout';
import { ServiceCarousel } from '@/components/ui/reservation/service-carousel';
import { Button } from '@/components/ui/button';
//import gimnasioImage from '../../images/Carrousel/image 148(1).png';
//import yogaImage from '../../images/Carrousel/image 150(1).png';
//import funcionalImage from '../../images/Carrousel/image 151(2).png';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { communityServicesApi } from '@/api/communities/community-services';
import { servicesApi } from '@/api/services/services';
import { Service } from '@/types/service';
import { CommunityService } from '@/types/community-service';
import { useReservation } from '@/context/reservation-context';
import { useEffect, useMemo } from 'react';

export const Route = createFileRoute(ReservaServiciosRoute)({
  component: ServiceStepComponent,
  validateSearch: z.object({
    servicio: z.string().optional(), // Permite pasar un query param `servicio`
  }),
});

interface ServiceInfo {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

function ServiceStepComponent() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/reserva/servicios' });
  const { reservationData, updateReservation } = useReservation();

  const selected = search.servicio ?? null;
  const communityId =
    reservationData.communityId || 'ade8c5e1-ab82-47e0-b48b-3f8f2324c450';

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
  const services: ServiceInfo[] = useMemo(() => {
    if (!servicesData.length || !communityServicesData.length) return [];

    const filtered = servicesData
      .map((service) => {
        const match = communityServicesData.find(
          (cs) => cs.service_id === service.id,
        );
        if (!match) return null;
        return {
          id: service.id,
          title: service.name,
          description: service.description,
          imageUrl: service.image_url,
        };
      })
      .filter((s): s is ServiceInfo => s !== null);

    // Debug: Log para verificar los datos (removemos en producción)
    console.log('Community ID:', communityId);
    console.log('Filtered Services count:', filtered.length);

    return filtered;
  }, [servicesData, communityServicesData, communityId]);

  // Actualizar el contexto cuando se selecciona un servicio
  useEffect(() => {
    if (selected && services.length > 0) {
      const selectedService = services.find((s) => s.title === selected);
      if (selectedService) {
        updateReservation({
          service: {
            id: selectedService.id,
            name: selectedService.title,
            description: selectedService.description,
            image_url: selectedService.imageUrl,
          },
        });
      }
    }
  }, [selected, services.length, updateReservation]); // updateReservation ahora es stable gracias a useCallback

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
        to: '/reserva/lugar',
        search: { servicio: selected },
      });
    }
  };

  return (
    <div>
      <div className="border p-6 rounded-md min-h-[430px] w-full">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-6">
            {/* Título */}
            <h3 className="text-xl font-semibold text-center">
              ¡Busca el servicio que más te guste!
            </h3>

            {/* Barra de búsqueda y ordenamiento */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <input
                type="text"
                placeholder="Buscar servicio ..."
                className="w-full md:w-1/2 border
                 border-gray-300 rounded-md px-4 py-2"
              />
              <select
                className="w-full md:w-1/4 border
                 border-gray-300 rounded-md px-4 py-2"
              >
                <option>Ordenar por</option>
                <option value="a-z">A-Z</option>
                <option value="z-a">Z-A</option>
              </select>
            </div>

            <div className="text-center text-sm text-gray-600">
              Resultados: {services.length} servicios
            </div>

            {/* Carousel */}
            <ServiceCarousel
              services={services.map((s) => ({
                title: s.title,
                description: s.description,
                imageUrl: s.imageUrl,
              }))}
              selected={selected}
              onSelect={handleSelect}
            />
          </div>
        </div>
      </div>

      {/* Botón siguiente */}
      <div className="flex justify-end mt-6">
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
