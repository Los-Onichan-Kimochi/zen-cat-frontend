import { apiClient } from '@/lib/api-client';

export interface UpdateAdminProfileRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  email: string;
  new_password: string;
}

export interface UpdateAdminProfileResponse {
  id: string;
  name: string;
  email: string;
  rol: string;
  image_url: string;
}

export const adminSettingsApi = {
  // Update admin profile (name, email, etc.)
  updateProfile: async (userId: string, data: UpdateAdminProfileRequest): Promise<UpdateAdminProfileResponse> => {
    const response = await apiClient.patch(`/user/${userId}/`, data);
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post('/user/change-password/', data);
    return response.data;
  },

  // Get current user info
  getCurrentUser: async (userId: string): Promise<UpdateAdminProfileResponse> => {
    const response = await apiClient.get(`/user/${userId}/`);
    return response.data;
  }
}; 