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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const sessionsApi = {
  // Get all sessions
  getSessions: async (): Promise<Session[]> => {
    const response = await fetch(`${API_BASE_URL}/session/`);
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

  // Get a specific session by ID
  getSession: async (sessionId: string): Promise<Session> => {
    const response = await fetch(`${API_BASE_URL}/session/${sessionId}/`);
    if (!response.ok) {
      throw new Error(`Error fetching session with id ${sessionId}`);
    }
    return response.json();
  },

  // Get availability for a specific date
  getAvailability: async (
    request: AvailabilityRequest,
  ): Promise<AvailabilityResult> => {
    const response = await fetch(`${API_BASE_URL}/session/availability/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error('Error fetching availability');
    }
    return response.json();
  },

  // Check for conflicts
  checkConflicts: async (
    request: CheckConflictRequest,
  ): Promise<ConflictResult> => {
    const response = await fetch(`${API_BASE_URL}/session/check-conflicts/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error('Error checking conflicts');
    }
    return response.json();
  },
};
 