import { Reservation, CreateReservationRequest, UpdateReservationRequest } from '@/types/reservation';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

export const reservationsApi = {
  // Get a single reservation
  getReservation: async (id: string): Promise<Reservation> => {
    return apiClient.get<Reservation>(API_ENDPOINTS.RESERVATIONS.BY_ID(id));
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

    const endpoint = `${API_ENDPOINTS.RESERVATIONS.BASE}?${params.toString()}`;
    return apiClient.get<{ reservations: Reservation[] }>(endpoint);
  },

  // Get reservations by session ID
  getReservationsBySession: async (sessionId: string): Promise<{ reservations: Reservation[] }> => {
    return reservationsApi.fetchReservations({ sessionIds: [sessionId] });
  },

  // Create a new reservation
  createReservation: async (reservation: CreateReservationRequest): Promise<Reservation> => {
    return apiClient.post<Reservation>(API_ENDPOINTS.RESERVATIONS.BASE, reservation);
  },

  // Update an existing reservation
  updateReservation: async (id: string, reservation: UpdateReservationRequest): Promise<Reservation> => {
    return apiClient.patch<Reservation>(API_ENDPOINTS.RESERVATIONS.BY_ID(id), reservation);
  },

  // Delete a reservation
  deleteReservation: async (id: string): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.RESERVATIONS.BY_ID(id));
  },

  // Bulk delete reservations
  bulkDeleteReservations: async (ids: string[]): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.RESERVATIONS.BULK_DELETE, { reservations: ids });
  },
}; 