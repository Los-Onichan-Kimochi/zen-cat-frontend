import { cn } from '@/lib/utils';

export interface Community {
  id: string;
  name: string;
  image: string;
  status: 'active' | 'suspended' | 'expired' | 'cancelled';
  type: string;
  membershipId?: string;
  startDate?: string;
  endDate?: string;
  planType?: 'MONTHLY' | 'ANNUAL';
  fee?: number;
  reservationsUsed?: number;
  reservationLimit?: number;
}

interface CommunityCardProps {
  community: Community;
  onAction: (communityId: string, action: string) => void;
  isSelected?: boolean;
}

const statusConfig = {
  active: {
    label: 'Membresía activa',
    textColor: 'text-green-800',
    bgColor: 'bg-green-100',
    buttonText: 'Ver más',
    selectedText: 'Seleccionado',
    buttonStyle: 'bg-black text-white hover:bg-gray-800',
    selectedStyle: 'bg-white text-black',
  },
  suspended: {
    label: 'Membresía suspendida',
    textColor: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    buttonText: 'Activar',
    selectedText: 'Seleccionado',
    buttonStyle: 'bg-black text-white hover:bg-gray-800',
    selectedStyle: 'bg-white text-black',
  },
  expired: {
    label: 'Membresía vencida',
    textColor: 'text-red-800',
    bgColor: 'bg-red-100',
    buttonText: 'Ver más',
    selectedText: 'Seleccionado',
    buttonStyle: 'bg-black text-white hover:bg-gray-800',
    selectedStyle: 'bg-white text-black',
  },
  cancelled: {
    label: 'Membresía cancelada',
    textColor: 'text-gray-800',
    bgColor: 'bg-gray-100',
    buttonText: 'Ver más',
    selectedText: 'Seleccionado',
    buttonStyle: 'bg-black text-white hover:bg-gray-800',
    selectedStyle: 'bg-white text-black',
  },
};

export function CommunityCard({
  community,
  onAction,
  isSelected = false,
}: CommunityCardProps) {
  const config = statusConfig[community.status];

  // Determinar el texto y estilo del botón basado en si está seleccionado
  const buttonText = isSelected ? config.selectedText : config.buttonText;
  const buttonStyle = isSelected ? config.selectedStyle : config.buttonStyle;

  // Determinar el estilo del fondo de la tarjeta basado en si está seleccionado
  const cardBgColor =
    isSelected && community.status === 'active' ? 'bg-black' : 'bg-white';
  const cardTextColor =
    isSelected && community.status === 'active' ? 'text-white' : 'text-black';
  const statusTextColor =
    isSelected && community.status === 'active'
      ? 'text-white'
      : config.textColor;
  const statusBgColor =
    isSelected && community.status === 'active'
      ? 'bg-gray-700'
      : config.bgColor;

  return (
    <div
      className={cn(
        'border border-gray-300 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow w-64 min-h-[200px]',
        cardBgColor,
      )}
    >
      <div className="text-center space-y-4 h-full flex flex-col justify-between">
        <div className="space-y-3">
          {/* Tipo de comunidad */}
          <div
            className={cn(
              'text-xs font-medium',
              isSelected && community.status === 'active'
                ? 'text-gray-300'
                : 'text-gray-600',
            )}
          >
            Comunidad
          </div>

          {/* Nombre de la comunidad */}
          <h3 className={cn('text-lg font-bold', cardTextColor)}>
            {community.name}
          </h3>

          {/* Estado de membresía */}
          <div
            className={cn(
              'inline-block px-3 py-1 rounded-full text-xs font-medium',
              statusTextColor,
              statusBgColor,
            )}
          >
            {config.label}
          </div>
        </div>

        {/* Botón de acción */}
        <button
          onClick={() => onAction(community.id, community.status)}
          className={cn(
            'w-full py-2 px-4 rounded-md text-sm font-medium transition-colors',
            buttonStyle,
          )}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
