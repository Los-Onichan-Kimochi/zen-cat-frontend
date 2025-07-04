import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import {
  Membership,
  MembershipsResponse,
  CreateMembershipRequest,
  UpdateMembershipRequest,
} from '@/types/membership';

export const membershipService = {
  /**
   * Gets all memberships
   * @returns Promise<MembershipsResponse> - All memberships
   */
  async getAllMemberships(): Promise<MembershipsResponse> {
    return await apiClient.get<MembershipsResponse>(
      API_ENDPOINTS.MEMBERSHIPS.BASE,
    );
  },

  /**
   * Gets a specific membership by ID
   * @param membershipId - The ID of the membership
   * @returns Promise<Membership> - The membership data
   */
  async getMembershipById(membershipId: string): Promise<Membership> {
    return await apiClient.get<Membership>(
      API_ENDPOINTS.MEMBERSHIPS.BY_ID(membershipId),
    );
  },

  /**
   * Gets all memberships for a specific user
   * @param userId - The ID of the user
   * @returns Promise<MembershipsResponse> - User's memberships
   */
  async getMembershipsByUser(userId: string): Promise<MembershipsResponse> {
    return await apiClient.get<MembershipsResponse>(
      API_ENDPOINTS.MEMBERSHIPS.BY_USER(userId),
    );
  },

  /**
   * Gets all memberships for a specific community
   * @param communityId - The ID of the community
   * @returns Promise<MembershipsResponse> - Community memberships
   */
  async getMembershipsByCommunity(
    communityId: string,
  ): Promise<MembershipsResponse> {
    return await apiClient.get<MembershipsResponse>(
      API_ENDPOINTS.MEMBERSHIPS.BY_COMMUNITY(communityId),
    );
  },

  /**
   * Gets all memberships for a specific user
   * @param userId - The ID of the user
   * @returns Promise<Membership[]>
   */
  async getMembershipsByUserId(userId: string): Promise<Membership[]> {
    try {
      const data = await apiClient.get<{ memberships: Membership[] }>(
        API_ENDPOINTS.MEMBERSHIPS.BY_USER(userId)
      );
      return data.memberships || [];
    } catch (error) {
      console.error(`Error fetching memberships for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Creates a new membership for a specific user
   * @param userId - The ID of the user
   * @param membershipData - The membership data to create
   * @returns Promise<Membership> - The created membership
   */
  async createMembershipForUser(
    userId: string,
    membershipData: CreateMembershipRequest,
  ): Promise<Membership> {
    try {
      const response = await apiClient.post<Membership>(
        API_ENDPOINTS.MEMBERSHIPS.CREATE_FOR_USER(userId),
        membershipData,
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Updates an existing membership
   * @param membershipId - The ID of the membership to update
   * @param updateData - Partial membership data to update
   * @returns Promise<Membership> - The updated membership
   */
  async updateMembership(
    membershipId: string,
    updateData: UpdateMembershipRequest,
  ): Promise<Membership> {
    return await apiClient.patch<Membership>(
      API_ENDPOINTS.MEMBERSHIPS.BY_ID(membershipId),
      updateData,
    );
  },

  /**
   * Deletes a membership
   * @param membershipId - The ID of the membership to delete
   */
  async deleteMembership(membershipId: string): Promise<void> {
    return await apiClient.delete(
      API_ENDPOINTS.MEMBERSHIPS.BY_ID(membershipId),
    );
  },
};
