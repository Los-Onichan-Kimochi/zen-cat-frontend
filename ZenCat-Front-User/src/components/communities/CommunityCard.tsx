import { cn } from '@/lib/utils'

export interface Community {
    id: string
    name: string
    status: 'active' | 'suspended' | 'expired'
    type: string
    membershipId?: string
    startDate?: string
    endDate?: string
    planType?: 'MONTHLY' | 'ANNUAL'
    fee?: number
    reservationLimit?: number
}

interface CommunityCardProps {
    community: Community
    onAction: (communityId: string, action: string) => void
}

const statusConfig = {
    active: {
        label: 'Membresía activa',
        textColor: 'text-black',
        bgColor: 'bg-gray-100',
        buttonText: 'Ver más',
        buttonStyle: 'bg-black text-white hover:bg-gray-800'
    },
    suspended: {
        label: 'Membresía suspendida',
        textColor: 'text-black',
        bgColor: 'bg-gray-100',
        buttonText: 'Activar',
        buttonStyle: 'bg-black text-white hover:bg-gray-800'
    },
    expired: {
        label: 'Membresía vencida',
        textColor: 'text-black',
        bgColor: 'bg-gray-100',
        buttonText: 'Ver más',
        buttonStyle: 'bg-black text-white hover:bg-gray-800'
    }
}

export function CommunityCard({ community, onAction }: CommunityCardProps) {
    const config = statusConfig[community.status]

    return (
        <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-center space-y-3">
                {/* Tipo de comunidad */}
                <div className="text-xs text-gray-600 font-medium">
                    {community.type}
                </div>

                {/* Nombre de la comunidad */}
                <h3 className="text-lg font-bold text-black">
                    {community.name}
                </h3>

                {/* Estado de membresía */}
                <div className={cn(
                    "inline-block px-3 py-1 rounded-full text-xs font-medium",
                    config.textColor,
                    config.bgColor
                )}>
                    {config.label}
                </div>

                {/* Botón de acción */}
                <button
                    onClick={() => onAction(community.id, community.status === 'suspended' ? 'activate' : 'view')}
                    className={cn(
                        "w-full py-2 px-4 rounded-md text-sm font-medium transition-colors",
                        config.buttonStyle
                    )}
                >
                    {config.buttonText}
                </button>
            </div>
        </div>
    )
}
