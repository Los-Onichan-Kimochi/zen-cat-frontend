import {
  Session,
  CreateSessionPayload,
  UpdateSessionPayload,
  BulkCreateSessionPayload,
  BulkDeleteSessionPayload,
  SessionFilters,
} from '@/types/session';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
    const url = `${API_BASE_URL}/session/${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error fetching sessions');
    }
    
    const data = await response.json();
    if (data && Array.isArray(data.sessions)) {
      return data.sessions;
    } else if (Array.isArray(data)) {
      return data;
    }
    console.error('Unexpected data structure from /session/ endpoint:', data);
    throw new Error('Unexpected data structure from sessions API');
  },

  getSessionById: async (id: string): Promise<Session> => {
    const response = await fetch(`${API_BASE_URL}/session/${id}/`);
    if (!response.ok) {
      throw new Error(`Error fetching session with id ${id}`);
    }
    return response.json();
  },

  createSession: async (payload: CreateSessionPayload): Promise<Session> => {
    console.log('Sending payload to backend:', payload);
    const response = await fetch(`${API_BASE_URL}/session/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error response:', response.status, errorData);
      throw new Error(`Error creating session: ${response.status} - ${errorData}`);
    }
    return response.json();
  },

  updateSession: async (id: string, payload: UpdateSessionPayload): Promise<Session> => {
    const response = await fetch(`${API_BASE_URL}/session/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Error updating session with id ${id}`);
    }
    return response.json();
  },

  deleteSession: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/session/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Error deleting session with id ${id}`);
    }
  },

  bulkCreateSessions: async (payload: BulkCreateSessionPayload): Promise<Session[]> => {
    const response = await fetch(`${API_BASE_URL}/session/bulk/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Error bulk creating sessions');
    }
    const data = await response.json();
    return data.sessions || data;
  },

  bulkDeleteSessions: async (payload: BulkDeleteSessionPayload): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/session/bulk-delete/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Error bulk deleting sessions');
    }
  },

  checkConflicts: async (data: CheckConflictRequest): Promise<ConflictResult> => {
    // Convertir al formato correcto para el backend
    const payload = {
      date: `${data.date}T00:00:00Z`,
      start_time: `${data.date}T${data.startTime}:00Z`,
      end_time: `${data.date}T${data.endTime}:00Z`,
      professional_id: data.professionalId,
      local_id: data.localId || null,
      exclude_id: data.excludeId || null,
    };
    
    console.log('⚡ Checking conflicts with:', payload);
    
    const response = await fetch(`${API_BASE_URL}/session/check-conflicts/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Conflict check error:', response.status, errorText);
      throw new Error('Error checking conflicts');
    }
    const result = await response.json();
    console.log('🔍 Conflict result:', result);
    return {
      hasConflict: result.has_conflict,
      professionalConflicts: result.professional_conflicts || [],
      localConflicts: result.local_conflicts || [],
    };
  },

  getAvailability: async (data: AvailabilityRequest): Promise<AvailabilityResult> => {
    // Convertir fecha a formato ISO correcto para el backend
    const payload = {
      date: `${data.date}T00:00:00Z`,
      professional_id: data.professionalId || null,
      local_id: data.localId || null,
    };
    
    console.log('🚀 Sending availability request:', payload);
    
    const response = await fetch(`${API_BASE_URL}/session/availability/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Availability error:', response.status, errorText);
      throw new Error('Error getting availability');
    }
    const result = await response.json();
    console.log('✅ Availability response:', result);
    return {
      isAvailable: result.is_available,
      busySlots: result.busy_slots || [],
    };
  },
}; 