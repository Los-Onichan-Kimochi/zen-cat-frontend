export interface Session {
  id: string;
  service: string; // ID o nombre del servicio
  professional_id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  link: string;
  available_slots: number;
  status?: 'ESPERANDO' | 'EN_CURSO' | 'COMPLETADA'; // si es necesario
}

export interface CreateSessionPayload {
  service: string;
  professional_id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  reservation_limit: number;
  session_link: string;
}

export type UpdateSessionPayload = Partial<CreateSessionPayload>;
