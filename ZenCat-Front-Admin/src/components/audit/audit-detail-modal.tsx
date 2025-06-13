import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Calendar,
  Globe,
  Monitor,
  CheckCircle,
  AlertCircle,
  Eye,
  Activity,
  Database,
  Info,
  Clock,
} from 'lucide-react';
import { AuditLog, ACTION_CONFIGS, ENTITY_CONFIGS } from '@/types/audit';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AuditDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLog: AuditLog | null;
}

export function AuditDetailModal({
  isOpen,
  onClose,
  auditLog,
}: AuditDetailModalProps) {
  if (!auditLog) return null;

  const actionConfig = ACTION_CONFIGS[auditLog.action] || { 
    label: auditLog.action, 
    className: 'bg-gray-100 text-gray-800' 
  };
  const entityConfig = ENTITY_CONFIGS[auditLog.entityType] || { 
    label: auditLog.entityType, 
    className: 'bg-gray-100 text-gray-800' 
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: format(date, 'dd/MM/yyyy', { locale: es }),
      time: format(date, 'HH:mm:ss', { locale: es }),
      full: format(date, 'dd/MM/yyyy HH:mm:ss', { locale: es }),
    };
  };

  const formatJsonData = (jsonString: string | null) => {
    if (!jsonString) return null;
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2);
    } catch {
      return jsonString;
    }
  };

  const formattedDate = formatDate(auditLog.createdAt);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] min-w-[120vh] overflow-y-auto font-montserrat">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center space-x-3 text-xl">
            <Eye className="h-6 w-6 text-gray-600" />
            <span>Detalles del Log de Auditoría</span>
            <Badge className={`${actionConfig.className} px-3 py-1`}>
              {actionConfig.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Activity className="h-5 w-5 text-blue-600" />
                <span>Información General</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${auditLog.success ? 'bg-green-100' : 'bg-red-100'}`}>
                    {auditLog.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <p className={`font-medium ${auditLog.success ? 'text-green-600' : 'text-red-600'}`}>
                      {auditLog.success ? 'Exitoso' : 'Con errores'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-gray-100">
                    <Clock className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha y Hora</p>
                    <p className="font-medium">{formattedDate.full}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-purple-100">
                    <Database className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Entidad</p>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${entityConfig.className} text-xs`}>
                        {entityConfig.label}
                      </Badge>
                      {auditLog.entityName && (
                        <span className="text-sm text-gray-600">({auditLog.entityName})</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Info className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ID del Log</p>
                    <p className="font-mono text-sm">{auditLog.id}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Information */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <User className="h-5 w-5 text-green-600" />
                <span>Información del Usuario</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" alt={auditLog.userEmail || 'Usuario'} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{auditLog.userEmail || 'Sistema'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Rol</p>
                      <Badge 
                        variant="outline" 
                        className={`${
                          auditLog.userRole === 'admin' 
                            ? 'bg-red-50 text-red-700 border-red-200' 
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {auditLog.userRole}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ID del Usuario</p>
                      <p className="font-mono text-sm">{auditLog.userId}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Information */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Monitor className="h-5 w-5 text-orange-600" />
                <span>Información Técnica</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-orange-100">
                    <Globe className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dirección IP</p>
                    <p className="font-mono text-sm">{auditLog.ipAddress || 'No disponible'}</p>
                  </div>
                </div>

                {auditLog.userAgent && (
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-full bg-orange-100 mt-1">
                      <Monitor className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">User Agent</p>
                      <p className="text-sm break-all">{auditLog.userAgent}</p>
                    </div>
                  </div>
                )}

                {auditLog.entityId && (
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-orange-100">
                      <Database className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ID de la Entidad</p>
                      <p className="font-mono text-sm">{auditLog.entityId}</p>
                    </div>
                  </div>
                )}

                {auditLog.additionalInfo && (
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-full bg-orange-100 mt-1">
                      <Info className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Información Adicional</p>
                      <p className="text-sm">{auditLog.additionalInfo}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error Information */}
          {!auditLog.success && auditLog.errorMessage && (
            <Card className="border-l-4 border-l-red-500 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span>Información del Error</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-red-100 p-4 rounded-lg">
                  <p className="text-red-800 font-mono text-sm">{auditLog.errorMessage}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Changes */}
          {(auditLog.oldValues || auditLog.newValues) && (
            <Card className="border-l-4 border-l-indigo-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Database className="h-5 w-5 text-indigo-600" />
                  <span>Cambios en los Datos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {auditLog.oldValues && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Valores Anteriores:</h4>
                    <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                        {formatJsonData(auditLog.oldValues)}
                      </pre>
                    </div>
                  </div>
                )}

                {auditLog.newValues && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Valores Nuevos:</h4>
                    <div className="bg-green-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                        {formatJsonData(auditLog.newValues)}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 