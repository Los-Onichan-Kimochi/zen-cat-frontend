import { ColumnDef } from '@tanstack/react-table';
import { AuditLog, ACTION_CONFIGS, ENTITY_CONFIGS } from '@/types/audit';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, User, Calendar, Globe, Monitor, AlertCircle, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GetAuditColumnsProps {
  onView?: (log: AuditLog) => void;
}

export function getAuditColumns({
  onView,
}: GetAuditColumnsProps = {}): ColumnDef<AuditLog>[] {
  return [
    {
      id: 'user',
      header: ({ column }) => (
        <div className="text-center font-bold">Usuario</div>
      ),
      cell: ({ row }) => {
        const log = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={log.userEmail || 'Usuario'} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">
                {log.userEmail || 'Sistema'}
              </span>
              {log.userRole && (
                <Badge 
                  variant="outline" 
                  className={`text-xs transition-all duration-200 hover:scale-105 ${
                    log.userRole === 'admin' 
                      ? 'bg-red-50 text-red-700 border-red-200' 
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {log.userRole}
                </Badge>
              )}
            </div>
          </div>
        );
      },
      meta: {
        displayName: 'Usuario',
      },
    },
    {
      accessorKey: 'action',
      header: ({ column }) => (
        <div className="text-center font-bold">Acción</div>
      ),
      cell: ({ row }) => {
        const action = row.getValue('action') as keyof typeof ACTION_CONFIGS;
        const config = ACTION_CONFIGS[action] || { 
          label: action, 
          className: 'bg-gray-100 text-gray-800' 
        };
        
        return (
          <div className="flex justify-center">
            <Badge className={`${config.className} font-medium px-3 py-1 transition-all duration-200 hover:scale-105`}>
              {config.label}
            </Badge>
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
        const log = row.original;
        const entityType = row.getValue('entityType') as keyof typeof ENTITY_CONFIGS;
        const config = ENTITY_CONFIGS[entityType] || { 
          label: entityType, 
          className: 'bg-gray-100 text-gray-800' 
        };
        
        return (
          <div className="flex flex-col items-center space-y-1">
            <Badge className={`${config.className} px-2 py-1 text-xs transition-all duration-200 hover:scale-105`}>
              {config.label}
            </Badge>
            {log.entityName && (
              <span className="text-xs text-gray-500 text-center max-w-32 truncate">
                {log.entityName}
              </span>
            )}
          </div>
        );
      },
      meta: {
        displayName: 'Entidad',
      },
    },
    {
      accessorKey: 'success',
      header: ({ column }) => (
        <div className="text-center font-bold">Estado</div>
      ),
      cell: ({ row }) => {
        const success = row.getValue('success') as boolean;
        
        return (
          <div className="flex justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2">
                    {success ? (
                      <CheckCircle className="h-5 w-5 text-green-600 transition-all duration-200 hover:scale-110" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 transition-all duration-200 hover:scale-110" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{success ? 'Éxito' : 'Error'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
      meta: {
        displayName: 'Estado',
      },
    },
    {
      accessorKey: 'ipAddress',
      header: ({ column }) => (
        <div className="text-center font-bold">IP</div>
      ),
      cell: ({ row }) => {
        const ipAddress = row.getValue('ipAddress') as string;
        
        return (
          <div className="flex items-center justify-center space-x-1">
            <Globe className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-mono">
              {ipAddress || '-'}
            </span>
          </div>
        );
      },
      meta: {
        displayName: 'Dirección IP',
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <div className="text-center font-bold">Fecha</div>
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt') as string;
        const date = new Date(createdAt);
        
        return (
          <div className="flex items-center justify-center space-x-1">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div className="flex flex-col text-center">
              <span className="text-sm">
                {date.toLocaleDateString('es-ES')}
              </span>
              <span className="text-xs text-gray-500">
                {date.toLocaleTimeString('es-ES')}
              </span>
            </div>
          </div>
        );
      },
      meta: {
        displayName: 'Fecha y Hora',
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
          <div className="flex items-center justify-center">
            {onView && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 cursor-pointer bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm transition-all duration-200 active:scale-95"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(log);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ver detalles</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      },
      enableSorting: false,
      meta: {
        displayName: 'Acciones',
      },
    },
  ];
} 