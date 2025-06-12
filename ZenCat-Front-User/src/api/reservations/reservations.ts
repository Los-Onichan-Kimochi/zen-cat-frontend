import {
  Reservation,
  CreateReservationRequest,
  UpdateReservationRequest,
  BulkDeleteReservationPayload,
} from '@/types/reservation';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

export const reservationsApi = {
  // Get all reservations with optional filters
  getReservations: async (
    userIds?: string[],
    sessionIds?: string[],
    states?: string[],
  ): Promise<Reservation[]> => {
    const params = new URLSearchParams();

    if (userIds && userIds.length > 0) {
      params.append('user_ids', userIds.join(','));
    }
    if (sessionIds && sessionIds.length > 0) {
      params.append('session_ids', sessionIds.join(','));
    }
    if (states && states.length > 0) {
      params.append('states', states.join(','));
    }

    const endpoint = `${API_ENDPOINTS.RESERVATIONS.BASE}?${params}`;
    const data = await apiClient.get<{ reservations: Reservation[] }>(endpoint);

    if (data && typeof data === 'object' && 'reservations' in data) {
      return data.reservations;
    }
    console.error(
      'Unexpected data structure from /reservation/ endpoint:',
      data,
    );
    throw new Error('Unexpected data structure from reservations API');
  },

  // Get a specific reservation by ID
  getReservation: async (reservationId: string): Promise<Reservation> => {
    return apiClient.get<Reservation>(API_ENDPOINTS.RESERVATIONS.BY_ID(reservationId));
  },

  // Create a new reservation
  createReservation: async (
    request: CreateReservationRequest,
  ): Promise<Reservation> => {
    return apiClient.post<Reservation>(API_ENDPOINTS.RESERVATIONS.BASE, request);
  },

  // Update a reservation
  updateReservation: async (
    reservationId: string,
    request: UpdateReservationRequest,
  ): Promise<Reservation> => {
    return apiClient.patch<Reservation>(
      API_ENDPOINTS.RESERVATIONS.BY_ID(reservationId),
      request,
    );
  },

  // Delete a reservation
  deleteReservation: async (reservationId: string): Promise<void> => {
    return apiClient.delete<void>(API_ENDPOINTS.RESERVATIONS.BY_ID(reservationId));
  },

  // Bulk delete reservations
  bulkDeleteReservations: async (
    payload: BulkDeleteReservationPayload,
  ): Promise<void> => {
    return apiClient.delete<void>(API_ENDPOINTS.RESERVATIONS.BULK_DELETE, payload);
  },
};
