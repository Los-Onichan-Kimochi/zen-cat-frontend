import {
  ErrorLog,
  ErrorLogFilters,
  ErrorLogStats,
  AuditLogFilters,
  mapAuditLogFromBackend,
} from '@/types/audit';
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
const buildQueryParams = (filters: ErrorLogFilters): string => {
  const params = new URLSearchParams();

  if (filters.page !== undefined)
    params.append('page', filters.page.toString());
  if (filters.limit !== undefined)
    params.append('pageSize', filters.limit.toString());
  if (filters.user_search) params.append('userIds', filters.user_search);
  if (filters.action) params.append('actions', filters.action);
  if (filters.entity_type) params.append('entityTypes', filters.entity_type);
  if (filters.user_role) params.append('userRoles', filters.user_role);
  if (filters.start_date) params.append('startDate', filters.start_date);
  if (filters.end_date) params.append('endDate', filters.end_date);

  return params.toString();
};

export const errorLogApi = {
  // Obtener logs de errores con filtros (solo eventos fallidos)
  getErrorLogs: async (
    filters: ErrorLogFilters = {},
  ): Promise<{
    logs: ErrorLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    try {
      // Force success=false for error logs (successful events go to audit logs)
      const errorFilters = { ...filters, success: false };
      const queryParams = buildQueryParams(errorFilters);
      const url = `${API_BASE_URL}/error-log/${queryParams ? `?${queryParams}` : ''}`;

      const response = await fetch(url, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', response.status, errorData);
        throw new Error(
          `Error fetching error logs: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log('Raw error logs data:', data);

      // Use the unified mapping function
      const mappedLogs = (data.audit_logs || []).map(mapAuditLogFromBackend);

      // Ensure all logs are actually error logs (success: false)
      const errorLogs = mappedLogs.filter(
        (log): log is ErrorLog => !log.success,
      );

      return {
        logs: errorLogs,
        total: data.total_count || 0,
        page: data.page || 1,
        limit: data.page_size || 10,
        totalPages: data.total_pages || 1,
      };
    } catch (error) {
      console.error('Error in getErrorLogs:', error);
      throw error;
    }
  },

  // Obtener estadísticas de errores
  getErrorStats: async (): Promise<ErrorLogStats> => {
    try {
      // Obtener estadísticas totales de auditoría para calcular el verdadero nivel de fallas
      const auditStatsResponse = await fetch(
        `${API_BASE_URL}/audit-log/stats/`,
        {
          headers: getHeaders(),
        },
      );

      if (!auditStatsResponse.ok) {
        const errorData = await auditStatsResponse.json().catch(() => null);
        console.error('Error response:', auditStatsResponse.status, errorData);
        throw new Error(
          `Error fetching audit stats: ${auditStatsResponse.status} ${auditStatsResponse.statusText}`,
        );
      }

      const auditStatsData = await auditStatsResponse.json();
      console.log(
        'Raw audit stats data for error calculations:',
        auditStatsData,
      );

      // Calcular estadísticas reales
      const totalEvents = auditStatsData.total_events || 0;
      const successfulEvents = auditStatsData.success_count || 0;
      const failedEvents = auditStatsData.failure_count || 0;

      // Calcular usuarios únicos afectados por errores
      const errorLogsResponse = await fetch(
        `${API_BASE_URL}/error-log/?pageSize=500`,
        {
          headers: getHeaders(),
        },
      );

      let uniqueUsers = 0;
      if (errorLogsResponse.ok) {
        const errorLogsData = await errorLogsResponse.json();
        const errorLogs = errorLogsData.audit_logs || [];

        // Calcular usuarios únicos afectados por errores
        const uniqueUserEmails = new Set();
        const uniqueUserIds = new Set();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        for (const log of errorLogs) {
          const logDate = new Date(log.created_at);
          if (logDate >= thirtyDaysAgo && log.success === false) {
            if (log.user_email && log.user_email !== 'sin autenticar') {
              uniqueUserEmails.add(log.user_email);
            }
            if (
              log.user_id &&
              log.user_id !== '00000000-0000-0000-0000-000000000000'
            ) {
              uniqueUserIds.add(log.user_id);
            }
          }
        }

        uniqueUsers = Math.max(uniqueUserEmails.size, uniqueUserIds.size);
      }

      // Categorizar errores críticos (puedes ajustar esta lógica según tus necesidades)
      const criticalErrors = Math.floor(failedEvents * 0.3); // Ejemplo: 30% de errores son críticos

      return {
        totalEvents: failedEvents, // Total de errores
        failedEvents: criticalErrors, // Errores considerados críticos
        errorRate: totalEvents > 0 ? (failedEvents / totalEvents) * 100 : 0, // Verdadero nivel de fallas
        uniqueUsers: uniqueUsers, // Usuarios afectados por errores
      };
    } catch (error) {
      console.error('Error in getErrorStats:', error);
      throw error;
    }
  },

  // Obtener log específico por ID
  getErrorLogById: async (id: string): Promise<ErrorLog> => {
    try {
      // Use the error-log endpoint once it's available, fallback to audit-log for now
      const response = await fetch(`${API_BASE_URL}/error-log/${id}/`, {
        headers: getHeaders(),
      }).catch(() =>
        // Fallback to audit-log endpoint if error-log endpoint doesn't exist yet
        fetch(`${API_BASE_URL}/audit-log/${id}/`, {
          headers: getHeaders(),
        }),
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', response.status, errorData);
        throw new Error(
          `Error fetching error log: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log('Raw error log data:', data);

      const mappedLog = mapAuditLogFromBackend(data);

      // Only return if it's actually an error (success = false)
      if (mappedLog.success !== false) {
        throw new Error('Requested log is not an error log');
      }

      return mappedLog as ErrorLog;
    } catch (error) {
      console.error('Error in getErrorLogById:', error);
      throw error;
    }
  },
};
