import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  AuthUser,
  RefreshTokenResponse,
} from '@/types/auth';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
    );

    // Store tokens in cookies after successful login
    if (response.tokens?.access_token && response.tokens?.refresh_token) {
      apiClient.setTokens({
        access_token: response.tokens.access_token,
        refresh_token: response.tokens.refresh_token,
        token_type: response.tokens.token_type || 'Bearer',
        expires_in: response.tokens.expires_in,
      });
    }

    return response;
  },

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      userData,
    );

    // Store tokens in cookies after successful registration
    if (response.tokens?.access_token && response.tokens?.refresh_token) {
      apiClient.setTokens({
        access_token: response.tokens.access_token,
        refresh_token: response.tokens.refresh_token,
        token_type: response.tokens.token_type || 'Bearer',
        expires_in: response.tokens.expires_in,
      });
    }

    return response;
  },

  async getCurrentUser(): Promise<AuthUser> {
    return apiClient.get<AuthUser>(API_ENDPOINTS.AUTH.ME);
  },

  async refreshToken(): Promise<RefreshTokenResponse> {
    return apiClient.post<RefreshTokenResponse>(API_ENDPOINTS.AUTH.REFRESH);
  },

  async logout(): Promise<void> {
    try {
      // Optionally call logout endpoint on server
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Continue with logout even if server call fails
      console.warn('Server logout failed:', error);
    } finally {
      // Always clear tokens from cookies
      apiClient.clearTokens();
    }
  },

  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  },
};
