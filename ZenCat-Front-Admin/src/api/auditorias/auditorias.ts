import { AuditLog, AuditLogFilters, AuditLogStats, mapAuditLogFromBackend } from '@/types/audit';
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
  if (filters.limit !== undefined) params.append('pageSize', filters.limit.toString());
  if (filters.user_search) params.append('userIds', filters.user_search);
  if (filters.action) params.append('actions', filters.action);
  if (filters.entity_type) params.append('entityTypes', filters.entity_type);
  if (filters.user_role) params.append('userRoles', filters.user_role);
  if (filters.success !== undefined) params.append('success', filters.success.toString());
  if (filters.start_date) params.append('startDate', filters.start_date);
  if (filters.end_date) params.append('endDate', filters.end_date);

  return params.toString();
};

export const auditoriasApi = {
  // Obtener logs de auditoría con filtros (solo eventos exitosos)
  getAuditLogs: async (filters: AuditLogFilters = {}): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    try {
      // Force success=true for audit logs (errors go to error logs)
      const auditFilters = { ...filters, success: true };
      const queryParams = buildQueryParams(auditFilters);
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
        logs: (data.audit_logs || []).map(mapAuditLogFromBackend),
        total: data.total_count || 0,
        page: data.page || 1,
        limit: data.page_size || 10,
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
        activeUsers: data.active_users || 0, // Ahora viene del backend
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

      return mapAuditLogFromBackend(data);
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