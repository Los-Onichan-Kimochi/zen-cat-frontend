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

export const Route = createFileRoute(ReservaServiciosRoute)({
  component: ServiceStepComponent,
  validateSearch: z.object({
    servicio: z.string().optional(), // Permite pasar un query param `servicio`
  }),
});

interface ServiceInfo {
  title: string;
  description: string;
  imageUrl: string;
}

function ServiceStepComponent() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/reserva/servicios' });
  const selected = search.servicio ?? null;
  const communityId = 'c730f30e-f6ed-40e6-a210-48ec017c9234';

  // Función para manejar la selección de un servicio
  const handleSelect = (servicio: string) => {
    navigate({
      to: ReservaServiciosRoute,
      search: { servicio }, // actualiza el query param `?servicio=...`
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

  const services: ServiceInfo[] = servicesData
    .map((service) => {
      const match = communityServicesData.find(
        (cs) => cs.service_id === service.id,
      );
      if (!match) return null;
      return {
        title: service.name,
        description: service.description,
        imageUrl: service.image_url,
      };
    })
    .filter((s): s is ServiceInfo => s !== null);

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

            {/* Carousel */}
            <ServiceCarousel
              services={services}
              selected={selected}
              onSelect={handleSelect}
            />
          </div>
        </div>
      </div>

      {/* Botón siguiente */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={() => {
            if (selected) {
              navigate({
                to: '/reserva/lugar',
                search: { servicio: selected },
              });
            }
          }}
          disabled={!selected}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
