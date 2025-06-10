import { Local, CreateLocalPayload, UpdateLocalPayload, BulkCreateLocalPayload, BulkDeleteLocalPayload } from '@/types/local';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

export const localsApi = {
  getLocals: async (): Promise<Local[]> => {
    const data = await apiClient.get<any>(API_ENDPOINTS.LOCALS.BASE);
    if (data && Array.isArray(data.locals)) {
      return data.locals;
    } else if (Array.isArray(data)) {
      return data;
    }
    console.error('Unexpected data structure from /local/ endpoint:', data);
    throw new Error('Unexpected data structure from locals API for list');
  },

  getLocalById: async (id: string): Promise<Local> => {
    return apiClient.get<Local>(API_ENDPOINTS.LOCALS.BY_ID(id));
  },

  createLocal: async (payload: CreateLocalPayload): Promise<Local> => {
    return apiClient.post<Local>(API_ENDPOINTS.LOCALS.BASE, payload);
  },

  updateLocal: async (
    id: string,
    payload: UpdateLocalPayload
  ): Promise<Local> => {
    return apiClient.patch<Local>(API_ENDPOINTS.LOCALS.BY_ID(id), payload);
  },

  deleteLocal: async (id: string): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.LOCALS.BY_ID(id));
  },

  bulkDeleteLocals: async (payload: BulkDeleteLocalPayload): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.LOCALS.BULK_DELETE, payload);
  },

  bulkCreateLocals: async (payload: BulkCreateLocalPayload): Promise<Local[]> => {
    const data = await apiClient.post<any>(API_ENDPOINTS.LOCALS.BULK_CREATE, payload);
    return data.locals || data;
  },
};
