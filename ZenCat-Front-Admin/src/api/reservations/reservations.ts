import { Reservation, CreateReservationRequest, UpdateReservationRequest } from '@/types/reservation';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const reservationsApi = {
  // Get a single reservation
  getReservation: async (id: string): Promise<Reservation> => {
    const response = await fetch(`${API_BASE_URL}/reservation/${id}/`);
    if (!response.ok) {
      throw new Error(`Error fetching reservation with id ${id}`);
    }
    return response.json();
  },

  // Fetch reservations with filters
  fetchReservations: async (filters?: {
    userIds?: string[];
    sessionIds?: string[];
    states?: string[];
  }): Promise<{ reservations: Reservation[] }> => {
    const params = new URLSearchParams();
    
    if (filters?.userIds?.length) {
      params.append('userIds', filters.userIds.join(','));
    }
    if (filters?.sessionIds?.length) {
      params.append('sessionIds', filters.sessionIds.join(','));
    }
    if (filters?.states?.length) {
      params.append('states', filters.states.join(','));
    }

    const response = await fetch(`${API_BASE_URL}/reservation/?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Error fetching reservations');
    }
    return response.json();
  },

  // Get reservations by session ID
  getReservationsBySession: async (sessionId: string): Promise<{ reservations: Reservation[] }> => {
    return reservationsApi.fetchReservations({ sessionIds: [sessionId] });
  },

  // Create a new reservation
  createReservation: async (reservation: CreateReservationRequest): Promise<Reservation> => {
    const response = await fetch(`${API_BASE_URL}/reservation/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservation),
    });
    if (!response.ok) {
      throw new Error('Error creating reservation');
    }
    return response.json();
  },

  // Update an existing reservation
  updateReservation: async (id: string, reservation: UpdateReservationRequest): Promise<Reservation> => {
    const response = await fetch(`${API_BASE_URL}/reservation/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservation),
    });
    if (!response.ok) {
      throw new Error(`Error updating reservation with id ${id}`);
    }
    return response.json();
  },

  // Delete a reservation
  deleteReservation: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/reservation/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Error deleting reservation with id ${id}`);
    }
  },

  // Bulk delete reservations
  bulkDeleteReservations: async (ids: string[]): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/reservation/bulk-delete/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reservations: ids }),
    });
    if (!response.ok) {
      throw new Error('Error bulk deleting reservations');
    }
  },
}; 