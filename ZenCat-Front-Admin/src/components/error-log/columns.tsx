import { ColumnDef } from '@tanstack/react-table';
import {
  ErrorLog,
  getActionConfig,
  getEntityConfig,
  AuditAction,
  AuditEntityType,
} from '@/types/audit';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  User,
  Calendar,
  Globe,
  AlertTriangle,
  Shield,
  XCircle,
  Wifi,
  Lock,
  Copy,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface GetErrorColumnsProps {
  onView?: (log: ErrorLog) => void;
}

export function getErrorColumns({
  onView,
}: GetErrorColumnsProps = {}): ColumnDef<ErrorLog>[] {
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
              <AvatarFallback className="bg-slate-100 text-slate-600">
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
                    log.userRole === 'ADMINISTRATOR'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : log.userRole === 'GUEST'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {log.userRole === 'GUEST'
                    ? 'invitado'
                    : log.userRole === 'ADMINISTRATOR'
                      ? 'administrador'
                      : log.userRole === 'CLIENT'
                        ? 'cliente'
                        : log.userRole}
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
      header: ({ column }) => (
        <div className="text-center font-bold">Acción</div>
      ),
      cell: ({ row }) => {
        const action = row.getValue('action') as AuditAction;
        const config = getActionConfig(action, true); // true for error styling

        return (
          <div className="flex justify-center">
            <Badge
              className={`${config.className} font-medium px-3 py-1 transition-all duration-200 hover:scale-105`}
            >
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
        const entityType = row.getValue('entityType') as AuditEntityType;
        const config = getEntityConfig(entityType, true); // true for error styling

        return (
          <div className="flex flex-col items-center space-y-1">
            <Badge
              className={`${config.className} px-2 py-1 text-xs transition-all duration-200 hover:scale-105 border-slate-200`}
            >
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
      accessorKey: 'error',
      header: ({ column }) => (
        <div className="text-center font-bold">Error</div>
      ),
      cell: ({ row }) => {
        const log = row.original;
        const errorMessage = log.errorMessage;
        const action = log.action;
        const entityType = log.entityType;

        // Create a more user-friendly error description
        let errorDescription = 'Error no especificado';
        let errorIcon = <AlertTriangle className="h-4 w-4 text-amber-500" />;

        if (errorMessage) {
          if (
            errorMessage.includes('record not found') ||
            errorMessage.includes('not found')
          ) {
            errorDescription = 'Registro no encontrado';
            errorIcon = <AlertTriangle className="h-4 w-4 text-amber-500" />;
          } else if (
            errorMessage.includes('unauthorized') ||
            errorMessage.includes('Unauthorized')
          ) {
            errorDescription = 'Sin autorización';
            errorIcon = <Shield className="h-4 w-4 text-amber-500" />;
          } else if (
            errorMessage.includes('validation') ||
            errorMessage.includes('invalid')
          ) {
            errorDescription = 'Datos inválidos';
            errorIcon = <XCircle className="h-4 w-4 text-slate-500" />;
          } else if (
            errorMessage.includes('connection') ||
            errorMessage.includes('timeout')
          ) {
            errorDescription = 'Error de conexión';
            errorIcon = <Wifi className="h-4 w-4 text-slate-500" />;
          } else if (
            errorMessage.includes('permission') ||
            errorMessage.includes('forbidden')
          ) {
            errorDescription = 'Sin permisos';
            errorIcon = <Lock className="h-4 w-4 text-amber-500" />;
          } else if (
            errorMessage.includes('duplicate') ||
            errorMessage.includes('already exists')
          ) {
            errorDescription = 'Ya existe';
            errorIcon = <Copy className="h-4 w-4 text-amber-500" />;
          } else {
            errorDescription = 'Error del sistema';
            errorIcon = <AlertTriangle className="h-4 w-4 text-amber-500" />;
          }
        } else {
          // If no error message, try to infer from action and entity
          const actionConfig = getActionConfig(action, true);
          const entityConfig = getEntityConfig(entityType, true);

          if (action === 'LOGIN') {
            errorDescription = 'Credenciales incorrectas';
            errorIcon = <Shield className="h-4 w-4 text-amber-500" />;
          } else if (action === 'CREATE') {
            errorDescription = `Error al crear ${entityConfig.label.toLowerCase()}`;
            errorIcon = <XCircle className="h-4 w-4 text-slate-500" />;
          } else if (action === 'UPDATE') {
            errorDescription = `Error al actualizar ${entityConfig.label.toLowerCase()}`;
            errorIcon = <XCircle className="h-4 w-4 text-slate-500" />;
          } else if (action === 'DELETE') {
            errorDescription = `Error al eliminar ${entityConfig.label.toLowerCase()}`;
            errorIcon = <XCircle className="h-4 w-4 text-slate-500" />;
          } else {
            errorDescription = `Error en operación ${actionConfig.errorLabel?.toLowerCase() || 'desconocida'}`;
            errorIcon = <AlertTriangle className="h-4 w-4 text-amber-500" />;
          }
        }

        return (
          <div className="flex items-center justify-center space-x-2">
            {errorIcon}
            <span className="text-sm font-medium text-gray-800">
              {errorDescription}
            </span>
          </div>
        );
      },
      meta: {
        displayName: 'Descripción del Error',
      },
    },
    {
      accessorKey: 'ipAddress',
      header: ({ column }) => <div className="text-center font-bold">IP</div>,
      cell: ({ row }) => {
        const ipAddress = row.getValue('ipAddress') as string;

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
                      className="h-8 w-8 p-0 cursor-pointer bg-white border-slate-300 hover:bg-black hover:text-white hover:border-black hover:shadow-sm transition-all duration-200 active:scale-95"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(log);
                      }}
                    >
                      <Eye className="h-4 w-4 text-slate-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ver detalles del error</p>
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
