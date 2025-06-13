import { AuditLog, AuditLogFilters, AuditLogStats } from '@/types/audit';
import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Función auxiliar para obtener los headers comunes
const getHeaders = () => {
  const token = Cookies.get('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Función para construir query parameters
const buildQueryParams = (filters: AuditLogFilters): string => {
  const params = new URLSearchParams();
  
  if (filters.page !== undefined) params.append('page', filters.page.toString());
  if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
  if (filters.user_search) params.append('user_search', filters.user_search);
  if (filters.action) params.append('action', filters.action);
  if (filters.entity_type) params.append('entity_type', filters.entity_type);
  if (filters.user_role) params.append('user_role', filters.user_role);
  if (filters.success !== undefined) params.append('success', filters.success.toString());
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);

  return params.toString();
};

// Función para mapear los datos del backend
const mapBackendAuditLogToAuditLog = (backendLog: any): AuditLog => {
  return {
    id: backendLog.id,
    userId: backendLog.user_id,
    userEmail: backendLog.user_email,
    userRole: backendLog.user_role,
    action: backendLog.action,
    entityType: backendLog.entity_type,
    entityId: backendLog.entity_id,
    entityName: backendLog.entity_name,
    oldValues: backendLog.old_values,
    newValues: backendLog.new_values,
    ipAddress: backendLog.ip_address,
    userAgent: backendLog.user_agent,
    additionalInfo: backendLog.additional_info,
    success: backendLog.success,
    errorMessage: backendLog.error_message,
    createdAt: backendLog.created_at,
  };
};

export const auditoriasApi = {
  // Obtener logs de auditoría con filtros
  getAuditLogs: async (filters: AuditLogFilters = {}): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    try {
      const queryParams = buildQueryParams(filters);
      const url = `${API_BASE_URL}/audit-log/${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', response.status, errorData);
        throw new Error(
          `Error fetching audit logs: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log('Raw audit logs data:', data);

      return {
        logs: (data.audit_logs || []).map(mapBackendAuditLogToAuditLog),
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 10,
        totalPages: data.total_pages || 1,
      };
    } catch (error) {
      console.error('Error in getAuditLogs:', error);
      throw error;
    }
  },

  // Obtener estadísticas de auditoría
  getAuditStats: async (): Promise<AuditLogStats> => {
    try {
      const response = await fetch(`${API_BASE_URL}/audit-log/stats/`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', response.status, errorData);
        throw new Error(
          `Error fetching audit stats: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log('Raw audit stats data:', data);

      return {
        totalEvents: data.total_events || 0,
        successfulEvents: data.success_count || 0,
        failedEvents: data.failure_count || 0,
        successRate: data.total_events > 0 ? ((data.success_count || 0) / data.total_events) * 100 : 0,
      };
    } catch (error) {
      console.error('Error in getAuditStats:', error);
      throw error;
    }
  },

  // Obtener log específico por ID
  getAuditLogById: async (id: string): Promise<AuditLog> => {
    try {
      const response = await fetch(`${API_BASE_URL}/audit-log/${id}/`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', response.status, errorData);
        throw new Error(
          `Error fetching audit log: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log('Raw audit log data:', data);

      return mapBackendAuditLogToAuditLog(data);
    } catch (error) {
      console.error('Error in getAuditLogById:', error);
      throw error;
    }
  },

  // Eliminar logs antiguos
  cleanupOldLogs: async (daysToKeep: number = 30): Promise<{ deletedCount: number }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/audit-log/cleanup/?days=${daysToKeep}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', response.status, errorData);
        throw new Error(
          `Error cleaning up audit logs: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log('Cleanup result:', data);

      return {
        deletedCount: data.deleted_count || 0,
      };
    } catch (error) {
      console.error('Error in cleanupOldLogs:', error);
      throw error;
    }
  },
}; 