import {
  Session,
  CreateSessionPayload,
  UpdateSessionPayload,
  BulkCreateSessionPayload,
  BulkDeleteSessionPayload,
  SessionFilters,
} from '@/types/session';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

// Función para convertir hora de Lima (UTC-5) a UTC
const convertLimaToUTC = (limaDateTimeString: string): string => {
  // Interpretar la fecha como hora de Lima (UTC-5)
  // Si en Lima son las 08:00, en UTC son las 13:00 (08:00 + 5 horas)
  const [datePart, timePart] = limaDateTimeString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second = 0] = timePart.split(':').map(Number);
  
  // Crear fecha en UTC considerando que la hora original es de Lima (UTC-5)
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour + 5, minute, second));
  
  return utcDate.toISOString();
};

export interface CheckConflictRequest {
  date: string;
  startTime: string;
  endTime: string;
  professionalId: string;
  localId?: string;
  excludeId?: string;
}

export interface ConflictResult {
  hasConflict: boolean;
  professionalConflicts: Session[];
  localConflicts: Session[];
}

export interface AvailabilityRequest {
  date: string;
  professionalId?: string;
  localId?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  title: string;
  type: 'professional' | 'local';
}

export interface AvailabilityResult {
  isAvailable: boolean;
  busySlots: TimeSlot[];
}

export const sessionsApi = {
  getSessions: async (filters?: SessionFilters): Promise<Session[]> => {
    const searchParams = new URLSearchParams();

    if (filters?.professionalIds?.length) {
      searchParams.append('professionalIds', filters.professionalIds.join(','));
    }
    if (filters?.localIds?.length) {
      searchParams.append('localIds', filters.localIds.join(','));
    }
    if (filters?.states?.length) {
      searchParams.append('states', filters.states.join(','));
    }

    const queryString = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.SESSIONS.BASE}${queryString ? `?${queryString}` : ''}`;

    const data = await apiClient.get<any>(endpoint);
    if (data && Array.isArray(data.sessions)) {
      return data.sessions;
    } else if (Array.isArray(data)) {
      return data;
    }
    console.error('Unexpected data structure from /session/ endpoint:', data);
    throw new Error('Unexpected data structure from sessions API');
  },

  getSessionById: async (id: string): Promise<Session> => {
    return apiClient.get<Session>(API_ENDPOINTS.SESSIONS.BY_ID(id));
  },

  createSession: async (payload: CreateSessionPayload): Promise<Session> => {
  
    
    // Convertir fechas de Lima (UTC-5) a UTC para el backend
    const backendPayload = {
      title: payload.title,
      date: convertLimaToUTC(payload.date),
      start_time: convertLimaToUTC(payload.start_time),
      end_time: convertLimaToUTC(payload.end_time),
      capacity: payload.capacity,
      session_link: payload.session_link,
      professional_id: payload.professional_id,
      local_id: payload.local_id,
    };
    

    
    return apiClient.post<Session>(API_ENDPOINTS.SESSIONS.BASE, backendPayload);
  },

  updateSession: async (
    id: string,
    payload: UpdateSessionPayload,
  ): Promise<Session> => {
    return apiClient.patch<Session>(API_ENDPOINTS.SESSIONS.BY_ID(id), payload);
  },

  deleteSession: async (id: string): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.SESSIONS.BY_ID(id));
  },

  bulkCreateSessions: async (payload: BulkCreateSessionPayload): Promise<Session[]> => {
    const data = await apiClient.post<any>(`${API_ENDPOINTS.SESSIONS.BASE}bulk/`, payload);
    return data.sessions || data;
  },

  bulkDeleteSessions: async (
    payload: BulkDeleteSessionPayload,
  ): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.SESSIONS.BULK_DELETE, payload);
  },

  checkConflicts: async (
    data: CheckConflictRequest,
  ): Promise<ConflictResult> => {
    // Convertir fechas de Lima (UTC-5) a UTC para el backend
    const payload = {
      date: convertLimaToUTC(`${data.date}T00:00:00`),
      start_time: convertLimaToUTC(`${data.date}T${data.startTime}:00`),
      end_time: convertLimaToUTC(`${data.date}T${data.endTime}:00`),
      professional_id: data.professionalId,
      local_id: data.localId || null,
      exclude_id: data.excludeId || null,
    };

    const result = await apiClient.post<any>(`${API_ENDPOINTS.SESSIONS.BASE}check-conflicts/`, payload);

    return {
      hasConflict: result.has_conflict,
      professionalConflicts: result.professional_conflicts || [],
      localConflicts: result.local_conflicts || [],
    };
  },

  getAvailability: async (
    data: AvailabilityRequest,
  ): Promise<AvailabilityResult> => {
    // Convertir fecha de Lima (UTC-5) a UTC para el backend
    const payload = {
      date: convertLimaToUTC(`${data.date}T00:00:00`),
      professional_id: data.professionalId || null,
      local_id: data.localId || null,
    };

    const result = await apiClient.post<any>(`${API_ENDPOINTS.SESSIONS.BASE}availability/`, payload);

    return {
      isAvailable: result.is_available,
      busySlots: result.busy_slots || [],
    };
  },
};
