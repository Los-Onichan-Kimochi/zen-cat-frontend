import { Button } from '@/components/ui/button';
import { Service } from '@/types/service';
import { Community } from './CommunityCard';

interface CommunityServiceCardProps {
    community: Community
    service: Service
    onAction: (communityId: string, action: string) => void
}

export function CommunityServiceCard({ community, service, onAction }: CommunityServiceCardProps) {
    console.log(service)
    return (
        <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow w-64 min-h-[200px]">
            <div className="text-center space-y-4 h-full flex flex-col justify-between">
                <div className="space-y-3">
                    {/* Nombre del servicio */}
                    <h3 className="text-lg font-bold text-black">
                        {service.name}
                    </h3>
                    {/* Descripción del servicio */}
                    <div>
                        
                    </div>
                </div>

                {/* Botón de acción */}
                <Button
                    onClick={() => onAction(community.id, community.status)}
                    className="w-full py-2 px-4 rounded-md text-sm font-medium transition-colors bg-black text-white hover:bg-gray-800"
                >
                    Nueva reserva
                </Button>
            </div>
        </div>
    )
}
