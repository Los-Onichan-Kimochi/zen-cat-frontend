// Audit Log Types
export interface AuditLog {
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
  success: boolean;
  errorMessage?: string;
  createdAt: string;
}

// Audit Actions
export type AuditAction = 
  | 'CREATE'
  | 'UPDATE' 
  | 'DELETE'
  | 'BULK_CREATE'
  | 'BULK_DELETE'
  | 'LOGIN'
  | 'REGISTER'
  | 'SUBSCRIBE'
  | 'UNSUBSCRIBE';

// Audit Entity Types
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
  | 'ONBOARDING';

// Audit Log Filters
export interface AuditLogFilters {
  page?: number;
  limit?: number;
  user_search?: string;
  action?: AuditAction;
  entity_type?: AuditEntityType;
  user_role?: 'admin' | 'user' | 'guest';
  success?: boolean;
  start_date?: string;
  end_date?: string;
}

// Audit Log Statistics
export interface AuditLogStats {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  successRate: number;
}

// Action Badge Configuration
export interface ActionBadgeConfig {
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className: string;
  label: string;
}

// Entity Badge Configuration
export interface EntityBadgeConfig {
  className: string;
  label: string;
}

// Constants for action and entity configurations
export const ACTION_CONFIGS: Record<AuditAction, ActionBadgeConfig> = {
  CREATE: {
    variant: 'default',
    className: 'bg-green-100 text-green-800 border-green-200',
    label: 'Crear'
  },
  UPDATE: {
    variant: 'default',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'Actualizar'
  },
  DELETE: {
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 border-red-200',
    label: 'Eliminar'
  },
  BULK_CREATE: {
    variant: 'default',
    className: 'bg-green-100 text-green-800 border-green-200',
    label: 'Crear Masivo'
  },
  BULK_DELETE: {
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 border-red-200',
    label: 'Eliminar Masivo'
  },
  LOGIN: {
    variant: 'default',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
    label: 'Iniciar Sesión'
  },
  REGISTER: {
    variant: 'default',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
    label: 'Registrarse'
  },
  SUBSCRIBE: {
    variant: 'default',
    className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    label: 'Suscribirse'
  },
  UNSUBSCRIBE: {
    variant: 'default',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    label: 'Desuscribirse'
  }
};

export const ENTITY_CONFIGS: Record<AuditEntityType, EntityBadgeConfig> = {
  USER: {
    className: 'bg-blue-50 text-blue-700',
    label: 'Usuario'
  },
  COMMUNITY: {
    className: 'bg-green-50 text-green-700',
    label: 'Comunidad'
  },
  PROFESSIONAL: {
    className: 'bg-purple-50 text-purple-700',
    label: 'Profesional'
  },
  LOCAL: {
    className: 'bg-orange-50 text-orange-700',
    label: 'Local'
  },
  PLAN: {
    className: 'bg-indigo-50 text-indigo-700',
    label: 'Plan'
  },
  SERVICE: {
    className: 'bg-teal-50 text-teal-700',
    label: 'Servicio'
  },
  SESSION: {
    className: 'bg-yellow-50 text-yellow-700',
    label: 'Sesión'
  },
  RESERVATION: {
    className: 'bg-pink-50 text-pink-700',
    label: 'Reserva'
  },
  MEMBERSHIP: {
    className: 'bg-cyan-50 text-cyan-700',
    label: 'Membresía'
  },
  ONBOARDING: {
    className: 'bg-gray-50 text-gray-700',
    label: 'Onboarding'
  }
}; 