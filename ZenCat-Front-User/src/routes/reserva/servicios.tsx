import {
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { ReservaServiciosRoute } from '@/layouts/reservation-layout';
import { ServiceCarousel } from '@/components/ui/reservation/service-carousel';
import { Button } from '@/components/ui/button';
import gimnasioImage from '../../images/Carrousel/image 148(1).png';
import yogaImage from '../../images/Carrousel/image 150(1).png';
import funcionalImage from '../../images/Carrousel/image 151(2).png';
import { z } from 'zod';

export const Route = createFileRoute(ReservaServiciosRoute)({
  component: AddServiceStepComponent,
  validateSearch: z.object({
    servicio: z.string().optional(),
  }),
});

const services = [
  {
    title: 'Gimnasio',
    description: 'Área para lactancia',
    imageUrl: gimnasioImage,
  },
  {
    title: 'Yoga',
    description: 'Consulta médica',
    imageUrl: yogaImage,
  },
  {
    title: 'Funcional',
    description: 'Clase de yoga',
    imageUrl: funcionalImage,
  },
  {
    title: 'Citas Médicas',
    description: 'Consulta médica',
    imageUrl: yogaImage,
  },
];

function AddServiceStepComponent() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/reserva/servicios' });
  const selected = search.servicio ?? null;

  const handleSelect = (servicio: string) => {
    navigate({
      to: ReservaServiciosRoute,
      search: { servicio },
      replace: true,
    });
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

            {/* Carousel */}
            <ServiceCarousel
              services={services}
              selected={selected}
              onSelect={handleSelect}
            />
          </div>
        </div>
      </div>

      {/* Botón centrado */}
      <div className="flex justify-center pt-6">
        <Button> Continuar </Button>
      </div>
    </div>
  );
}
