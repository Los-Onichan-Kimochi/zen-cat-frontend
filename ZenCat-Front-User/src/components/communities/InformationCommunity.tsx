import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Community } from './CommunityCard';
import { TabCommunityServices } from './TabCommunityServices';
import { TabCommunityGeneral } from './TabCommunityGeneral';
import { Service } from '@/types/service';

interface InformationCommunityProps {
  community: Community | null;
  services: Service[] | null;
}

export function InformationCommunity({
  community,
  services,
}: InformationCommunityProps) {
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
        {/* Lista de pestañas */}
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

        {/* Contenido de las pestañas */}
        <TabsContent value="general" className="mt-2">
          <TabCommunityGeneral community={community}/>
        </TabsContent>

        <TabsContent value="servicios" className="mt-2">
          <TabCommunityServices
            community={community}
            services={services ?? []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
