export interface Reservation {
  id: string;
  name: string;
  reservation_time: string;
  state: string;
  last_modification: string;
  user_id: string;
  session_id: string;
}

export interface ReservationsResponse {
  reservations: Reservation[];
}

export interface CreateReservationRequest {
  name: string;
  reservation_time: string;
  state: string;
  user_id: string;
  session_id: string;
}

export interface UpdateReservationRequest {
  name?: string;
  reservation_time?: string;
  state?: string;
  user_id?: string;
  session_id?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const reservationsApi = {
  // Get all reservations
  getReservations: async (
    userIds?: string[],
    sessionIds?: string[],
    states?: string[],
  ): Promise<Reservation[]> => {
    const params = new URLSearchParams();
    if (userIds && userIds.length > 0) {
      params.append('userIds', userIds.join(','));
    }
    if (sessionIds && sessionIds.length > 0) {
      params.append('sessionIds', sessionIds.join(','));
    }
    if (states && states.length > 0) {
      params.append('states', states.join(','));
    }

    const queryString = params.toString();
    const url = queryString
      ? `${API_BASE_URL}/reservation/?${queryString}`
      : `${API_BASE_URL}/reservation/`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error fetching reservations');
    }
    const data = await response.json();
    if (data && Array.isArray(data.reservations)) {
      return data.reservations;
    } else if (Array.isArray(data)) {
      return data;
    }
    console.error(
      'Unexpected data structure from /reservation/ endpoint:',
      data,
    );
    throw new Error('Unexpected data structure from reservations API');
  },

  // Get a specific reservation by ID
  getReservation: async (reservationId: string): Promise<Reservation> => {
    const response = await fetch(
      `${API_BASE_URL}/reservation/${reservationId}/`,
    );
    if (!response.ok) {
      throw new Error(`Error fetching reservation with id ${reservationId}`);
    }
    return response.json();
  },

  // Create a new reservation
  createReservation: async (
    request: CreateReservationRequest,
  ): Promise<Reservation> => {
    const response = await fetch(`${API_BASE_URL}/reservation/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error('Error creating reservation');
    }
    return response.json();
  },

  // Update an existing reservation
  updateReservation: async (
    reservationId: string,
    request: UpdateReservationRequest,
  ): Promise<Reservation> => {
    const response = await fetch(
      `${API_BASE_URL}/reservation/${reservationId}/`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      },
    );
    if (!response.ok) {
      throw new Error(`Error updating reservation with id ${reservationId}`);
    }
    return response.json();
  },

  // Delete a reservation
  deleteReservation: async (reservationId: string): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/reservation/${reservationId}/`,
      {
        method: 'DELETE',
      },
    );
    if (!response.ok) {
      throw new Error(`Error deleting reservation with id ${reservationId}`);
    }
  },
};
 