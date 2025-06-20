import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Community } from './CommunityCard';
import { TabCommunityServices } from './TabCommunityServices';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Service } from '@/types/service';
import { useNavigate } from '@tanstack/react-router';

interface InformationCommunityProps {
  community: Community | null;
  services: Service[] | null;
}

export function InformationCommunity({
  community,
  services,
}: InformationCommunityProps) {

    const navigate = useNavigate(); // Inicializa el hook de navegación

  const handleViewReservations = () => {
    if (community) {
      // Codificar el nombre de la comunidad para la URL
      // Redirigir a la URL correcta con los parámetros
      navigate({
        to: `/mis-comunidades/${community.id}/reservas/historial`, // La ruta
        search: { name: community.name } // Parámetro adicional de consulta
      });
    }
  };


  if (community == null) {
    // Si no hay comunidad, mostramos solo la imagen de AstroCat dentro de un div estilizado como Card
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-8 shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="opacity-30">
            <img
              src="/ico-astrocat.svg"
              alt="AstroCat"
              className="w-48 h-48 object-contain filter blur-sm"
            />
          </div>
        </div>
      </div>
    );
  }

  // Si `community` no es null, mostramos la información de la comunidad
  return (
    <div>
      <Tabs defaultValue="general" className="w-full">
        {/* 2.1 Lista de pestañas */}
        <TabsList className="grid w-full grid-cols-2 rounded-full bg-gray-200">
          <TabsTrigger
            value="general"
            className="rounded-full text-sm font-medium transition-colors focus:ring-2 focus:ring-gray-400"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="servicios"
            className="rounded-full text-sm font-medium transition-colors focus:ring-2 focus:ring-gray-400"
          >
            Servicios
          </TabsTrigger>
        </TabsList>

        {/* 2.2 Contenido de cada pestaña */}
        <TabsContent value="general" className="mt-4">
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm py-6">
            <div className='flex justify-between px-6'>
              <div className='text-left'>
                <h1 className="text-4xl font-black">{community.name}</h1>
              </div>
              <div className='text-right text-xl font-bold'>
                <p>
                  {community.status === 'active'
                    ? 'Membresía activa'
                    : community.status === 'suspended'
                    ? 'Membresía suspendida'
                    : 'Membresía vencida'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 mt-4 px-2">
              {/* Bloque de imagen */}
              <div className="flex justify-center items-center border-r border-gray-500 px-4">
                <img
                  src={community.image || 'default-image-url'}
                  alt="Imagen de la comunidad"
                  className="rounded-md shadow-md w-full h-full"
                />
              </div>
              {/* Bloque de botones */}
              <div className="space-y-2 px-4 border-r border-gray-500">
                <h2 className='font-bold text-2xl'>Acciones</h2>
                <Button className="w-full text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white">Nueva reserva</Button>
                <Button className="w-full text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white" onClick={handleViewReservations}>Ver reservas</Button>
                <Button className="w-full text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white">Ver membresías</Button>
                <Button className="w-full text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white">Suspender membresía</Button>
              </div>
              {/* Bloque de información de membresía */}
              <div className="px-4 space-y-4">
                <h2 className='font-bold text-2xl mb-4'>Membresía</h2>
                <div className="space-y-5">
                  <div className="flex justify-between">
                    <p className="text-gray-600">Tipo de plan:</p>
                    <p>{community.planType}</p>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-gray-600">Reservas disponibles:</p>
                    <p>{community.reservationLimit}</p>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-gray-600">Reservas usadas:</p>
                    <p></p>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-gray-600">Fecha de inicio:</p>
                    <p>
                      {community.startDate
                        ? format(new Date(community.startDate), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })
                        : 'Sin fecha'}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-gray-600">Fecha de fin:</p>
                    <p>
                      {community.endDate
                        ? format(new Date(community.endDate), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })
                        : 'Sin fecha'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="servicios" className="mt-4">
          <TabCommunityServices
            community={community}
            services={services ?? []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
