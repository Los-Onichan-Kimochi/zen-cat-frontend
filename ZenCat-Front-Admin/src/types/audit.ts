// Unified Audit & Error Log Types

// Base interface for all audit events
export interface BaseAuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  userRole?: 'admin' | 'user' | 'guest';
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  entityName?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  additionalInfo?: Record<string, any>;
  createdAt: string;
}

// Successful audit log (used in audit page - only shows successful operations)
export interface AuditLog extends BaseAuditLog {
  success: true; // Always true for audit logs
}

// Failed audit log (used in error log page - only shows failed operations)
export interface FailedAuditLog extends BaseAuditLog {
  success: false; // Always false for error logs
  errorMessage?: string;
}

// Alias for failed audit logs
export type ErrorLog = FailedAuditLog;

// Complete Audit Actions (synchronized with backend)
export type AuditAction =
  // Admin actions
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'BULK_CREATE'
  | 'BULK_DELETE'
  // User actions
  | 'LOGIN'
  | 'LOGOUT'
  | 'REGISTER'
  | 'SUBSCRIBE'
  | 'UNSUBSCRIBE'
  | 'CREATE_RESERVATION'
  | 'CANCEL_RESERVATION'
  | 'UPDATE_PROFILE';

// Complete Audit Entity Types (synchronized with backend)
export type AuditEntityType =
  | 'USER'
  | 'COMMUNITY'
  | 'PROFESSIONAL'
  | 'LOCAL'
  | 'PLAN'
  | 'SERVICE'
  | 'SESSION'
  | 'RESERVATION'
  | 'MEMBERSHIP'
  | 'ONBOARDING'
  | 'COMMUNITY_PLAN'
  | 'COMMUNITY_SERVICE'
  | 'SERVICE_LOCAL'
  | 'SERVICE_PROFESSIONAL';

// Unified filters that work for both audit and error logs
export interface AuditLogFilters {
  page?: number;
  limit?: number;
  user_search?: string;
  action?: AuditAction;
  entity_type?: AuditEntityType;
  user_role?: 'admin' | 'user' | 'guest';
  success?: boolean; // undefined = all, true = success only, false = errors only
  start_date?: string;
  end_date?: string;
}

// Error-specific filters (alias for clarity)
export type ErrorLogFilters = Omit<AuditLogFilters, 'success'>;

// Unified statistics
export interface AuditLogStats {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  successRate: number;
  activeUsers?: number; // Optional field for active users count
}

// Error-specific stats (alias for clarity)
export interface ErrorLogStats {
  totalEvents: number; // Same as failedEvents for error logs
  failedEvents: number;
  errorRate: number; // Always 100% for error logs
  uniqueUsers?: number; // Usuarios afectados por errores
}

// Unified Badge Configuration
export interface ActionBadgeConfig {
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className: string;
  label: string;
  errorClassName?: string; // Override for error styling
  errorLabel?: string; // Override for error text
}

export interface EntityBadgeConfig {
  className: string;
  label: string;
  errorClassName?: string; // Override for error styling
}

// Helper function to get action config based on context
export const getActionConfig = (
  action: AuditAction,
  isError: boolean = false,
): ActionBadgeConfig => {
  const config = ACTION_CONFIGS[action];
  if (isError && config.errorClassName) {
    return {
      ...config,
      className: config.errorClassName,
      label: config.errorLabel || `Error ${config.label}`,
    };
  }
  return config;
};

// Helper function to get entity config based on context
export const getEntityConfig = (
  entityType: AuditEntityType,
  isError: boolean = false,
): EntityBadgeConfig => {
  const config = ENTITY_CONFIGS[entityType];
  if (isError && config.errorClassName) {
    return {
      ...config,
      className: config.errorClassName,
    };
  }
  return config;
};

// Complete action configurations with error variants
export const ACTION_CONFIGS: Record<AuditAction, ActionBadgeConfig> = {
  CREATE: {
    variant: 'default',
    className: 'bg-green-100 text-green-800 border-green-200',
    label: 'Crear Registro',
    errorClassName: 'bg-slate-100 text-slate-800 border-slate-200',
    errorLabel: 'Fallo al Crear',
  },
  UPDATE: {
    variant: 'default',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'Actualizar Datos',
    errorClassName: 'bg-slate-100 text-slate-800 border-slate-200',
    errorLabel: 'Fallo al Actualizar',
  },
  DELETE: {
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 border-red-200',
    label: 'Eliminar Registro',
    errorClassName: 'bg-amber-100 text-amber-800 border-amber-200',
    errorLabel: 'Fallo al Eliminar',
  },
  BULK_CREATE: {
    variant: 'default',
    className: 'bg-green-100 text-green-800 border-green-200',
    label: 'Creación Masiva',
    errorClassName: 'bg-slate-100 text-slate-800 border-slate-200',
    errorLabel: 'Fallo en Creación Masiva',
  },
  BULK_DELETE: {
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 border-red-200',
    label: 'Eliminación Masiva',
    errorClassName: 'bg-amber-100 text-amber-800 border-amber-200',
    errorLabel: 'Fallo en Eliminación Masiva',
  },
  LOGIN: {
    variant: 'default',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
    label: 'Inicio de Sesión',
    errorClassName: 'bg-amber-100 text-amber-800 border-amber-200',
    errorLabel: 'Fallo de Autenticación',
  },
  LOGOUT: {
    variant: 'default',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
    label: 'Cierre de Sesión',
    errorClassName: 'bg-amber-100 text-amber-800 border-amber-200',
    errorLabel: 'Fallo al Cerrar Sesión',
  },
  REGISTER: {
    variant: 'default',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
    label: 'Registro de Usuario',
    errorClassName: 'bg-slate-100 text-slate-800 border-slate-200',
    errorLabel: 'Fallo en Registro',
  },
  SUBSCRIBE: {
    variant: 'default',
    className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    label: 'Suscripción',
    errorClassName: 'bg-slate-100 text-slate-800 border-slate-200',
    errorLabel: 'Fallo en Suscripción',
  },
  UNSUBSCRIBE: {
    variant: 'default',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    label: 'Cancelar Suscripción',
    errorClassName: 'bg-slate-100 text-slate-800 border-slate-200',
    errorLabel: 'Fallo al Cancelar Suscripción',
  },
  CREATE_RESERVATION: {
    variant: 'default',
    className: 'bg-teal-100 text-teal-800 border-teal-200',
    label: 'Nueva Reserva',
    errorClassName: 'bg-slate-100 text-slate-800 border-slate-200',
    errorLabel: 'Fallo al Reservar',
  },
  CANCEL_RESERVATION: {
    variant: 'default',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
    label: 'Cancelar Reserva',
    errorClassName: 'bg-amber-100 text-amber-800 border-amber-200',
    errorLabel: 'Fallo al Cancelar Reserva',
  },
  UPDATE_PROFILE: {
    variant: 'default',
    className: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    label: 'Actualizar Perfil',
    errorClassName: 'bg-slate-100 text-slate-800 border-slate-200',
    errorLabel: 'Fallo al Actualizar Perfil',
  },
};

// Complete entity configurations with error variants
export const ENTITY_CONFIGS: Record<AuditEntityType, EntityBadgeConfig> = {
  USER: {
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    label: 'Usuario del Sistema',
    errorClassName: 'bg-slate-50 text-slate-700 border-slate-200',
  },
  COMMUNITY: {
    className: 'bg-green-50 text-green-700 border-green-200',
    label: 'Comunidad',
    errorClassName: 'bg-slate-50 text-slate-700 border-slate-200',
  },
  PROFESSIONAL: {
    className: 'bg-purple-50 text-purple-700 border-purple-200',
    label: 'Profesional',
    errorClassName: 'bg-slate-50 text-slate-700 border-slate-200',
  },
  LOCAL: {
    className: 'bg-orange-50 text-orange-700 border-orange-200',
    label: 'Local/Sede',
    errorClassName: 'bg-slate-50 text-slate-700 border-slate-200',
  },
  PLAN: {
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    label: 'Plan de Membresía',
    errorClassName: 'bg-slate-50 text-slate-700 border-slate-200',
  },
  SERVICE: {
    className: 'bg-teal-50 text-teal-700 border-teal-200',
    label: 'Servicio',
    errorClassName: 'bg-slate-50 text-slate-700 border-slate-200',
  },
  SESSION: {
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    label: 'Sesión/Clase',
    errorClassName: 'bg-slate-50 text-slate-700 border-slate-200',
  },
  RESERVATION: {
    className: 'bg-pink-50 text-pink-700 border-pink-200',
    label: 'Reserva',
    errorClassName: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  MEMBERSHIP: {
    className: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    label: 'Membresía',
    errorClassName: 'bg-slate-50 text-slate-700 border-slate-200',
  },
  ONBOARDING: {
    className: 'bg-gray-50 text-gray-700 border-gray-200',
    label: 'Proceso de Registro',
    errorClassName: 'bg-slate-50 text-slate-700 border-slate-200',
  },
  COMMUNITY_PLAN: {
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    label: 'Plan de Comunidad',
    errorClassName: 'bg-slate-50 text-slate-700 border-slate-200',
  },
  COMMUNITY_SERVICE: {
    className: 'bg-lime-50 text-lime-700 border-lime-200',
    label: 'Servicio Comunitario',
    errorClassName: 'bg-slate-50 text-slate-700 border-slate-200',
  },
  SERVICE_LOCAL: {
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    label: 'Asignación Servicio-Local',
    errorClassName: 'bg-slate-50 text-slate-700 border-slate-200',
  },
  SERVICE_PROFESSIONAL: {
    className: 'bg-violet-50 text-violet-700 border-violet-200',
    label: 'Asignación Servicio-Profesional',
    errorClassName: 'bg-slate-50 text-slate-700 border-slate-200',
  },
};

// Utility function to convert snake_case to camelCase
export const toCamelCase = (obj: any): any => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }

  const camelCaseObj: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
      letter.toUpperCase(),
    );
    camelCaseObj[camelKey] = toCamelCase(value);
  }
  return camelCaseObj;
};

// Utility function to map backend audit log to frontend format
export const mapAuditLogFromBackend = (backendLog: any): AuditLog => {
  const converted = toCamelCase(backendLog);

  // Mapear roles del backend al frontend
  const mapRole = (backendRole: string): 'admin' | 'user' | 'guest' => {
    switch (backendRole) {
      case 'ADMINISTRATOR':
        return 'admin';
      case 'CLIENT':
        return 'user';
      case 'GUEST':
        return 'guest';
      default:
        return 'guest'; // Default fallback for unknown roles
    }
  };

  return {
    id: converted.id,
    userId: converted.userId,
    userEmail: converted.userEmail,
    userRole: converted.userRole ? mapRole(converted.userRole) : undefined,
    action: converted.action,
    entityType: converted.entityType,
    entityId: converted.entityId,
    entityName: converted.entityName,
    oldValues: converted.oldValues,
    newValues: converted.newValues,
    ipAddress: converted.ipAddress,
    userAgent: converted.userAgent,
    additionalInfo: converted.additionalInfo,
    success: converted.success,
    errorMessage: converted.errorMessage,
    createdAt: converted.createdAt,
  } as AuditLog;
};
