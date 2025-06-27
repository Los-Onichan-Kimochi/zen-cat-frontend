import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertTriangle, 
  User, 
  Clock, 
  Globe, 
  Monitor,
  FileText,
  Info,
  Copy,
  CheckCircle,
  Activity,
  Database,
  Bug
} from 'lucide-react';
import { ErrorLog, getActionConfig, getEntityConfig } from '@/types/audit';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AuditLog } from '@/types/audit';

interface ErrorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorLog: ErrorLog | AuditLog | null;
}

export function ErrorDetailModal({ isOpen, onClose, errorLog }: ErrorDetailModalProps) {
  const [copiedFields, setCopiedFields] = React.useState<Set<string>>(new Set());

  if (!errorLog) return null;

  const actionConfig = getActionConfig(errorLog.action, true);
  const entityConfig = getEntityConfig(errorLog.entityType, true);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: format(date, 'dd/MM/yyyy', { locale: es }),
      time: format(date, 'HH:mm:ss', { locale: es }),
      full: format(date, 'dd/MM/yyyy HH:mm:ss', { locale: es }),
    };
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFields(prev => new Set([...prev, fieldName]));
      setTimeout(() => {
        setCopiedFields(prev => {
          const newSet = new Set(prev);
          newSet.delete(fieldName);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const renderJsonData = (data: Record<string, any> | undefined, title: string, fieldName: string) => {
    if (!data || Object.keys(data).length === 0) return null;

    const jsonString = JSON.stringify(data, null, 2);
    const isCopied = copiedFields.has(fieldName);

    return (
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-700">
              {title}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(jsonString, fieldName)}
              className="flex items-center gap-1 text-xs"
            >
              {isCopied ? (
                <>
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copiar
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <pre className="text-xs bg-gray-50 p-3 rounded-md overflow-x-auto max-h-40 border">
            <code>{jsonString}</code>
          </pre>
        </CardContent>
      </Card>
    );
  };

  // Function to get a user-friendly error explanation
  const getErrorExplanation = (errorMessage: string | null, action: string, entityType: string) => {
    if (errorMessage) {
      const message = errorMessage.toLowerCase();
      const actionLabel = action.toLowerCase();
      const entityLabel = entityType.toLowerCase();
      
      if (message.includes('record not found') || message.includes('not found')) {
        return `No se pudo encontrar ${entityLabel} solicitado para ${actionLabel}. Es posible que el registro haya sido eliminado o no exista.`;
      } else if (message.includes('unauthorized') || message.includes('authentication')) {
        return `Las credenciales proporcionadas no son válidas o han expirado. Verifique los datos de acceso.`;
      } else if (message.includes('validation') || message.includes('invalid')) {
        return `Los datos proporcionados no cumplen con los requisitos necesarios para ${actionLabel} ${entityLabel}.`;
      } else if (message.includes('duplicate') || message.includes('exists')) {
        return `Ya existe un registro similar. No se puede ${actionLabel} ${entityLabel} duplicado.`;
      } else if (message.includes('timeout') || message.includes('connection')) {
        return `Se produjo un problema de conexión al intentar ${actionLabel} ${entityLabel}. Intente nuevamente.`;
      } else {
        return `Ocurrió un error técnico al intentar ${actionLabel} ${entityLabel}. Contacte al administrador si el problema persiste.`;
      }
    } else {
      // If no error message, try to infer from action and entity (same logic as column)
      const actionLabel = action.toLowerCase();
      const entityLabel = entityType.toLowerCase();
      
      if (action === 'LOGIN') {
        return 'Las credenciales proporcionadas son incorrectas. Verifique el email y contraseña.';
      } else if (action === 'CREATE') {
        return `Error al crear ${entityLabel}. Verifique que los datos sean válidos y no estén duplicados.`;
      } else if (action === 'UPDATE') {
        return `Error al actualizar ${entityLabel}. Es posible que el registro no exista o los datos sean inválidos.`;
      } else if (action === 'DELETE') {
        return `Error al eliminar ${entityLabel}. Es posible que el registro no exista o esté siendo utilizado por otros elementos.`;
      } else {
        return `Error en operación de ${actionLabel} sobre ${entityLabel}. Contacte al administrador si el problema persiste.`;
      }
    }
  };

  const formatAdditionalInfo = (additionalInfo: Record<string, any> | null) => {
    if (!additionalInfo) return null;
    
    // Extract useful information from additionalInfo
    const info = typeof additionalInfo === 'string' ? additionalInfo : JSON.stringify(additionalInfo, null, 2);
    return info;
  };

  const formattedDate = formatDate(errorLog.createdAt);
  const errorMessage = 'errorMessage' in errorLog ? errorLog.errorMessage || null : null;
  const errorExplanation = getErrorExplanation(errorMessage, actionConfig.label, entityConfig.label);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-slate-700">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Error de Sistema
          </DialogTitle>
          <DialogDescription>
            Información detallada sobre el error registrado en el sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error Summary */}
          <Card className="border-slate-200">
            <CardHeader className="bg-slate-50">
              <CardTitle className="flex items-center space-x-2 text-slate-700">
                <Bug className="h-5 w-5 text-amber-500" />
                Detalles del Error
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-slate-100">
                    <Activity className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Código de Estado</p>
                    <p className="font-medium text-gray-900">Error del Sistema</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-slate-100">
                    <Database className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Entidad Afectada</p>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${entityConfig.className} text-sm`}>
                        {entityConfig.label}
                      </Badge>
                      {errorLog.entityName && (
                        <span className="text-sm text-gray-600">({errorLog.entityName})</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-medium text-amber-800 mb-2">Explicación del Error:</h4>
                <p className="text-amber-700 text-sm">{errorExplanation}</p>
              </div>

              {errorMessage && (
                <div className="mt-4 p-3 bg-gray-50 rounded border">
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Mensaje Técnico:
                  </h4>
                  <code className="text-xs text-gray-600 break-all">{errorMessage}</code>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    ID del Error
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                      {errorLog.id}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(errorLog.id, 'id')}
                      className="p-1 h-6 w-6"
                    >
                      {copiedFields.has('id') ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Fecha y Hora
                  </label>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {formattedDate.full}
                  </div>
                </div>

                {errorLog.entityId && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      ID de Entidad
                    </label>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono block">
                      {errorLog.entityId}
                    </code>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Information */}
          {(errorLog.userEmail || errorLog.userRole) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  Información del Usuario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {errorLog.userEmail && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Email
                      </label>
                      <p className="text-sm">{errorLog.userEmail}</p>
                    </div>
                  )}

                  {errorLog.userRole && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Rol
                      </label>
                      <Badge variant="outline" className="text-xs">
                        {errorLog.userRole}
                      </Badge>
                    </div>
                  )}

                  {errorLog.userId && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        ID de Usuario
                      </label>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono block">
                        {errorLog.userId}
                      </code>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technical Information */}
          {(errorLog.ipAddress || errorLog.userAgent) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Monitor className="h-4 w-4" />
                  Información Técnica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {errorLog.ipAddress && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Dirección IP
                    </label>
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-gray-400" />
                      {errorLog.ipAddress}
                    </div>
                  </div>
                )}

                {errorLog.userAgent && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      User Agent
                    </label>
                    <p className="text-xs bg-gray-50 p-2 rounded border font-mono break-all">
                      {errorLog.userAgent}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Additional Data */}
          <div className="space-y-4">
            {renderJsonData(errorLog.oldValues, 'Valores Anteriores', 'oldValues')}
            {renderJsonData(errorLog.newValues, 'Valores Nuevos', 'newValues')}
            {renderJsonData(errorLog.additionalInfo, 'Información Adicional', 'additionalInfo')}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ErrorDetailModal; 