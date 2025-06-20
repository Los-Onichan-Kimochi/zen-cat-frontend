import { ColumnDef } from '@tanstack/react-table';
import { AuditLog, ACTION_CONFIGS, ENTITY_CONFIGS, AuditAction, AuditEntityType } from '@/types/audit';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, User, Calendar, Globe, Monitor } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface GetAuditColumnsProps {
  onView?: (log: AuditLog) => void;
}

// Memoizar las columnas para evitar recreaciones innecesarias
export const getAuditColumns = ({ onView }: GetAuditColumnsProps): ColumnDef<AuditLog>[] => [
  {
    accessorKey: 'userEmail',
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <User size={16} />
        <span>Usuario</span>
      </div>
    ),
    cell: ({ row }) => {
      const user = row.original.user;
      const userEmail = row.original.userEmail;
      const userRole = row.original.userRole;
      
      return (
        <div className="flex items-center gap-3">
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
                variant="secondary" 
                className="w-fit text-xs mt-1"
              >
                {userRole === 'GUEST' ? 'invitado' : 
                 userRole === 'ADMINISTRATOR' ? 'administrador' : 
                 userRole === 'CLIENT' ? 'cliente' : 
                 userRole}
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
    header: 'Acción',
    cell: ({ row }) => {
      const action = row.original.action;
      const config = ACTION_CONFIGS[action as AuditAction];
      
      if (!config) {
        return (
          <Badge variant="secondary" className="text-xs">
            {action}
          </Badge>
        );
      }
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge 
                className={`${config.className} text-xs`}
              >
                {config.label}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{config.description || config.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    meta: {
      displayName: 'Acción',
    },
  },
  {
    accessorKey: 'entityType',
    header: 'Entidad',
    cell: ({ row }) => {
      const entityType = row.original.entityType;
      const config = ENTITY_CONFIGS[entityType as AuditEntityType];
      
      if (!config) {
        return (
          <Badge variant="secondary" className="text-xs">
            {entityType}
          </Badge>
        );
      }
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge 
                className={`${config.className} text-xs`}
              >
                {config.label}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{config.description || config.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    meta: {
      displayName: 'Entidad',
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <Calendar size={16} />
        <span>Fecha</span>
      </div>
    ),
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      
      // Validate if createdAt is valid before creating Date object
      if (!createdAt || createdAt === '') {
        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm text-gray-500">
              Fecha no disponible
            </span>
            <span className="text-xs text-gray-500">
              Hora no disponible
            </span>
          </div>
        );
      }
      
      const date = new Date(createdAt);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm text-red-500">
              Fecha inválida
            </span>
            <span className="text-xs text-red-500">
              Hora inválida
            </span>
          </div>
        );
      }
      
      return (
        <div className="flex flex-col">
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
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <Globe size={16} />
        <span>IP</span>
      </div>
    ),
    cell: ({ row }) => {
      const ipAddress = row.original.ipAddress;
      return (
        <span className="text-sm font-mono">
          {ipAddress || 'No disponible'}
        </span>
      );
    },
    meta: {
      displayName: 'Dirección IP',
    },
  },
  {
    accessorKey: 'userAgent',
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <Monitor size={16} />
        <span>Navegador</span>
      </div>
    ),
    cell: ({ row }) => {
      const userAgent = row.original.userAgent;
      
      if (!userAgent) {
        return <span className="text-sm text-gray-500">No disponible</span>;
      }
      
      // Extraer información básica del user agent
      let browserInfo = 'Desconocido';
      if (userAgent.includes('Chrome')) browserInfo = 'Chrome';
      else if (userAgent.includes('Firefox')) browserInfo = 'Firefox';
      else if (userAgent.includes('Safari')) browserInfo = 'Safari';
      else if (userAgent.includes('Edge')) browserInfo = 'Edge';
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className="text-sm">{browserInfo}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs break-words">{userAgent}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    meta: {
      displayName: 'Navegador',
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const log = row.original;
      
      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView?.(log)}
                  className="h-8 w-8 p-0"
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