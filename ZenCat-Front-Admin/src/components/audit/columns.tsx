import { ColumnDef } from '@tanstack/react-table';
import {
  AuditLog,
  ACTION_CONFIGS,
  ENTITY_CONFIGS,
  AuditAction,
  AuditEntityType,
} from '@/types/audit';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, User, Calendar, Globe, Monitor } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface GetAuditColumnsProps {
  onView?: (log: AuditLog) => void;
}

// Memoizar las columnas para evitar recreaciones innecesarias
export const getAuditColumns = ({
  onView,
}: GetAuditColumnsProps): ColumnDef<AuditLog>[] => [
  {
    accessorKey: 'userEmail',
    header: ({ column }) => (
      <div className="text-center font-bold">Usuario</div>
    ),
    cell: ({ row }) => {
      const user = row.original.user;
      const userEmail = row.original.userEmail;
      const userRole = row.original.userRole;

      return (
        <div className="flex items-center justify-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="" />
            <AvatarFallback className="text-xs">
              {user?.name?.charAt(0) || userEmail?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {user?.name || userEmail || 'Usuario desconocido'}
            </span>
            {userEmail && (
              <span className="text-xs text-gray-500 truncate max-w-[150px]">
                {userEmail}
              </span>
            )}
            {userRole && (
              <Badge
                variant="outline"
                className={`text-xs transition-all duration-200 hover:scale-105 ${
                  userRole === 'ADMINISTRATOR'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : userRole === 'GUEST'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                {userRole === 'GUEST'
                  ? 'invitado'
                  : userRole === 'ADMINISTRATOR'
                    ? 'administrador'
                    : userRole === 'CLIENT'
                      ? 'cliente'
                      : userRole}
              </Badge>
            )}
          </div>
        </div>
      );
    },
    meta: {
      displayName: 'Email',
    },
  },
  {
    accessorKey: 'action',
    header: ({ column }) => <div className="text-center font-bold">Acción</div>,
    cell: ({ row }) => {
      const action = row.original.action;
      const config = ACTION_CONFIGS[action as AuditAction];

      if (!config) {
        return (
          <div className="flex justify-center">
            <Badge variant="secondary" className="text-xs">
              {action}
            </Badge>
          </div>
        );
      }

      return (
        <div className="flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge
                  className={`${config.className} font-medium px-3 py-1 transition-all duration-200 hover:scale-105`}
                >
                  {config.label}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{config.description || config.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
    meta: {
      displayName: 'Acción',
    },
  },
  {
    accessorKey: 'entityType',
    header: ({ column }) => (
      <div className="text-center font-bold">Entidad</div>
    ),
    cell: ({ row }) => {
      const entityType = row.original.entityType;
      const config = ENTITY_CONFIGS[entityType as AuditEntityType];

      if (!config) {
        return (
          <div className="flex justify-center">
            <Badge variant="secondary" className="text-xs">
              {entityType}
            </Badge>
          </div>
        );
      }

      return (
        <div className="flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge
                  className={`${config.className} px-2 py-1 text-xs transition-all duration-200 hover:scale-105 border-slate-200`}
                >
                  {config.label}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{config.description || config.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
    meta: {
      displayName: 'Entidad',
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <div className="text-center font-bold">Fecha</div>,
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;

      // Validate if createdAt is valid before creating Date object
      if (!createdAt || createdAt === '') {
        return (
          <div className="flex flex-col items-center">
            <span className="font-medium text-sm text-gray-500">
              Fecha no disponible
            </span>
            <span className="text-xs text-gray-500">Hora no disponible</span>
          </div>
        );
      }

      const date = new Date(createdAt);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return (
          <div className="flex flex-col items-center">
            <span className="font-medium text-sm text-red-500">
              Fecha inválida
            </span>
            <span className="text-xs text-red-500">Hora inválida</span>
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center">
          <span className="font-medium text-sm">
            {format(date, 'dd/MM/yyyy', { locale: es })}
          </span>
          <span className="text-xs text-gray-500">
            {format(date, 'HH:mm:ss', { locale: es })}
          </span>
        </div>
      );
    },
    meta: {
      displayName: 'Fecha y Hora',
    },
  },
  {
    accessorKey: 'ipAddress',
    header: ({ column }) => <div className="text-center font-bold">IP</div>,
    cell: ({ row }) => {
      const ipAddress = row.original.ipAddress;

      return (
        <div className="flex items-center justify-center space-x-1">
          <Globe className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-mono">
            {ipAddress || 'No disponible'}
          </span>
        </div>
      );
    },
    meta: {
      displayName: 'Dirección IP',
    },
  },
  {
    accessorKey: 'userAgent',
    header: ({ column }) => (
      <div className="text-center font-bold">Navegador</div>
    ),
    cell: ({ row }) => {
      const userAgent = row.original.userAgent;

      if (!userAgent) {
        return (
          <div className="flex items-center justify-center">
            <span className="text-sm text-gray-500">No disponible</span>
          </div>
        );
      }

      // Extraer información básica del user agent
      let browserInfo = 'Desconocido';
      if (userAgent.includes('Chrome')) browserInfo = 'Chrome';
      else if (userAgent.includes('Firefox')) browserInfo = 'Firefox';
      else if (userAgent.includes('Safari')) browserInfo = 'Safari';
      else if (userAgent.includes('Edge')) browserInfo = 'Edge';

      return (
        <div className="flex items-center justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center space-x-1">
                  <Monitor className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">{browserInfo}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs break-words">{userAgent}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
    meta: {
      displayName: 'Navegador',
    },
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <div className="text-center font-bold">Acciones</div>
    ),
    cell: ({ row }) => {
      const log = row.original;

      return (
        <div className="flex items-center justify-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView?.(log)}
                  className="h-8 w-8 p-0 transition-all duration-200 hover:scale-105"
                >
                  <Eye size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ver detalles</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
];
