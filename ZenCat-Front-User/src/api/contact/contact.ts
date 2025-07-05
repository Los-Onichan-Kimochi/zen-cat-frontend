import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

export interface SendContactRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface SendContactResponse {
  message: string;
}

export const contactApi = {
  sendMessage: async (
    request: SendContactRequest,
  ): Promise<SendContactResponse> => {
    return apiClient.post<SendContactResponse>(
      API_ENDPOINTS.CONTACT.SEND,
      request,
    );
  },
};
