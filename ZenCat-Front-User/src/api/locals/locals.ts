import {
  Local,
  CreateLocalRequest,
  UpdateLocalRequest,
  BulkCreateLocalPayload,
  BulkDeleteLocalPayload,
} from '@/types/local';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

export interface LocalsResponse {
  locals: Local[];
}

export const localsApi = {
  // Get all locals
  getLocals: async (): Promise<Local[]> => {
    const data = await apiClient.get<{ locals: Local[] }>(
      API_ENDPOINTS.LOCALS.BASE,
    );
    if (data && Array.isArray(data.locals)) {
      return data.locals;
    } else if (Array.isArray(data)) {
      return data;
    }
    console.error('Unexpected data structure from /local/ endpoint:', data);
    throw new Error('Unexpected data structure from locals API');
  },

  // Get a specific local by ID
  getLocal: async (localId: string): Promise<Local> => {
    return apiClient.get<Local>(API_ENDPOINTS.LOCALS.BY_ID(localId));
  },
};
