export interface Reservation {
  id: string;
  name: string;
  reservation_time: string;
  state: ReservationState;
  last_modification: string;
  user_id: string;
  session_id: string;
  // Extended fields for display (might come from joins)
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  session_title?: string;
}

export enum ReservationState {
  DONE = 'DONE',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  ANULLED = 'ANULLED',
}

export interface CreateReservationRequest {
  name: string;
  reservation_time: string;
  state: ReservationState;
  user_id: string;
  session_id: string;
}

export interface UpdateReservationRequest {
  name?: string;
  reservation_time?: string;
  state?: ReservationState;
  user_id?: string;
  session_id?: string;
} 