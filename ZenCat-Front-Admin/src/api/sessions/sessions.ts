import {
  Session,
  CreateSessionPayload,
  UpdateSessionPayload,
  BulkCreateSessionPayload,
  BulkDeleteSessionPayload,
  SessionFilters,
} from '@/types/session';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
    

    
    const response = await fetch(`${API_BASE_URL}/session/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error response:', response.status, errorData);
      throw new Error(
        `Error creating session: ${response.status} - ${errorData}`,
      );
    }
    return response.json();
  },

  updateSession: async (
    id: string,
    payload: UpdateSessionPayload,
  ): Promise<Session> => {
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

  bulkDeleteSessions: async (
    payload: BulkDeleteSessionPayload,
  ): Promise<void> => {
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

    return {
      isAvailable: result.is_available,
      busySlots: result.busy_slots || [],
    };
  },
};
