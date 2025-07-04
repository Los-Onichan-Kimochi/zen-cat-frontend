import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

export interface ServiceReportData {
  ServiceType: string;
  Total: number;
  Data: { Date: string; Count: number }[];
}

export interface ServiceReportResponse {
  totalReservations: number;
  services: ServiceReportData[];
}

export const reportesApi = {
  getServiceReport: async ({
    from,
    to,
    groupBy,
  }: {
    from?: string;
    to?: string;
    groupBy?: string;
  }) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (groupBy) params.append('groupBy', groupBy);
    const endpoint = `${API_ENDPOINTS.REPORTS.SERVICES}?${params.toString()}`;
    return apiClient.get<ServiceReportResponse>(endpoint);
  },
};
