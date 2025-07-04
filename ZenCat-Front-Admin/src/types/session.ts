export enum SessionState {
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
}

export interface Session {
  id: string;
  title: string;
  date: string; // ISO date string
  start_time: string; // ISO datetime string
  end_time: string; // ISO datetime string
  state: SessionState;
  registered_count: number;
  capacity: number;
  session_link?: string | null;
  professional_id: string;
  local_id?: string | null;
  community_service_id?: string;
}

export interface CreateSessionPayload {
  title: string;
  date: string; // ISO date string
  start_time: string; // ISO datetime string
  end_time: string; // ISO datetime string
  capacity: number;
  session_link?: string | null;
  professional_id: string;
  local_id?: string | null;
  community_service_id: string;
}

export interface UpdateSessionPayload {
  title?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  state?: SessionState;
  capacity?: number;
  session_link?: string | null;
  professional_id?: string;
  local_id?: string | null;
  community_service_id?: string; // Added to match CreateSessionPayload
}

export interface BulkCreateSessionPayload {
  sessions: CreateSessionPayload[];
}

export interface BulkDeleteSessionPayload {
  sessions: string[]; // array of session IDs
}

export type SessionFilters = {
  professionalIds?: string[];
  localIds?: string[];
  states?: SessionState[];
};
