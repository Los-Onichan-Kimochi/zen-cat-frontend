import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import { SessionFilters } from '@/types/session';

export interface Session {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  state: string;
  registered_count: number;
  capacity: number;
  session_link?: string;
  professional_id: string;
  local_id?: string;
  community_service_id: string;
}

export interface SessionsResponse {
  sessions: Session[];
}

export interface TimeSlot {
  start: string;
  end: string;
  title: string;
  type: string;
}

export interface AvailabilityRequest {
  date: string;
  professional_id?: string;
  local_id?: string;
}

export interface AvailabilityResult {
  is_available: boolean;
  busy_slots: TimeSlot[];
}

export interface CheckConflictRequest {
  date: string;
  start_time: string;
  end_time: string;
  professional_id: string;
  local_id?: string;
  exclude_id?: string;
}

export interface ConflictResult {
  has_conflict: boolean;
  professional_conflicts: Session[];
  local_conflicts: Session[];
}

export const sessionsApi = {
  // Get all sessions

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

  // Get a specific session by ID
  getSession: async (sessionId: string): Promise<Session> => {
    return apiClient.get<Session>(API_ENDPOINTS.SESSIONS.BY_ID(sessionId));
  },

  // Get availability for a specific date
  getAvailability: async (
    request: AvailabilityRequest,
  ): Promise<AvailabilityResult> => {
    return apiClient.post<AvailabilityResult>(
      '/session/availability/',
      request,
    );
  },

  // Check for conflicts
  checkConflicts: async (
    request: CheckConflictRequest,
  ): Promise<ConflictResult> => {
    return apiClient.post<ConflictResult>('/session/check-conflicts/', request);
  },
};
