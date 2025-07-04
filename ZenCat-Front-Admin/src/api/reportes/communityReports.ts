import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

export interface CommunityReportData {
  CommunityId: string;
  CommunityName: string;
  Total: number;
  // Métricas por estado
  ActiveMemberships: number;
  ExpiredMemberships: number;
  CancelledMemberships: number;
  // Métricas de engagement
  ActiveUsers: number;
  InactiveUsers: number;
  TotalReservations: number;
  // Métricas de planes
  MonthlyPlans: number;
  AnnualPlans: number;
  // Datos temporales
  Data: { Date: string; Count: number }[];
}

export interface CommunityReportSummary {
  totalActiveMemberships: number;
  totalExpiredMemberships: number;
  totalCancelledMemberships: number;
  totalActiveUsers: number;
  totalInactiveUsers: number;
  totalReservations: number;
  totalMonthlyPlans: number;
  totalAnnualPlans: number;
}

export interface CommunityReportResponse {
  totalMemberships: number;
  communities: CommunityReportData[];
  summary: CommunityReportSummary;
}

export const communityReportsApi = {
  getCommunityReport: async ({
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
    const endpoint = `${API_ENDPOINTS.REPORTS.COMMUNITIES}?${params.toString()}`;
    return apiClient.get<CommunityReportResponse>(endpoint);
  },
};
