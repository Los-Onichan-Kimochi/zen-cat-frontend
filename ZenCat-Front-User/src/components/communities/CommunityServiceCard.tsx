import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Service } from '@/types/service';
import { Community } from './CommunityCard';

interface CommunityServiceCardProps {
  community: Community;
  service: Service;
  onAction: (communityId: string, action: string) => void;
}

export function CommunityServiceCard({
  community,
  service,
  onAction,
}: CommunityServiceCardProps) {
  console.log(service);
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm m-2 flex flex-col justify-between">
      <div className="space-y-3">
        {/* Nombre del servicio */}
        <h3 className="text-xl font-bold text-center">{service.name}</h3>
        
        {/* Indicador de tipo de servicio */}
        <div className="flex justify-center">
          <Badge 
            variant={service.is_virtual ? "default" : "secondary"}
            className={service.is_virtual 
              ? "bg-blue-100 text-blue-800 hover:bg-blue-200" 
              : "bg-green-100 text-green-800 hover:bg-green-200"
            }
          >
            {service.is_virtual ? "Virtual" : "Presencial"}
          </Badge>
        </div>
        
        {/* Descripción del servicio */}
        <p className="text-sm text-gray-700 text-justify">
          {service.description}
        </p>
      </div>

      {/* Botón de acción */}
      <div className="mt-4">
        <Button
          onClick={() => onAction(community.id, 'reserve')}
          className="w-full bg-black text-white hover:bg-gray-800"
        >
          Nueva reserva
        </Button>
      </div>
    </div>
  );
}
