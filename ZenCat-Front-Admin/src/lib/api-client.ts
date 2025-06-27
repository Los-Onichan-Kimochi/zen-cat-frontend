import Cookies from 'js-cookie';
import { API_CONFIG } from '@/config/api';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  status?: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in?: number;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    return Cookies.get('access_token') || null;
  }

  private setAuthTokens(tokens: AuthTokens): void {
    // For development, set access token to expire in 2 hours (0.083 days)
    // The expires_in from backend is in nanoseconds (Go time.Duration), not seconds
    const accessTokenExpiry = 2 / 24; // 2 hours in days
    
    Cookies.set('access_token', tokens.access_token, {
      expires: accessTokenExpiry,
      secure: window.location.protocol === 'https:',
      sameSite: 'strict',
    });
    Cookies.set('refresh_token', tokens.refresh_token, {
      expires: 7, // 7 days for refresh token
      secure: window.location.protocol === 'https:',
      sameSite: 'strict',
    });
  }

  private removeAuthTokens(): void {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
  }

  private async refreshToken(): Promise<AuthTokens | null> {
    const refreshToken = Cookies.get('refresh_token');
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (response.ok) {
        const text = await response.text();
        if (text) {
          const tokens: AuthTokens = JSON.parse(text);
          this.setAuthTokens(tokens);
          return tokens;
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return null;
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle token expiration
    if (response.status === 401 && token) {
      const newTokens = await this.refreshToken();
      if (newTokens) {
        headers.Authorization = `Bearer ${newTokens.access_token}`;
        response = await fetch(url, {
          ...options,
          headers,
        });
      } else {
        // Refresh failed, redirect to login
        this.removeAuthTokens();
        window.location.href = '/login';
        throw new Error('Authentication failed');
      }
    }

    // Handle insufficient privileges (403 Forbidden)
    if (response.status === 403) {
      // User doesn't have the required role for this action
      throw new Error('No tienes permisos suficientes para realizar esta acción');
    }

    if (!response.ok) {
      let error = {};
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text();
          if (text) {
            error = JSON.parse(text);
          }
        }
      } catch (e) {
        // Ignore JSON parsing errors for error responses
      }
      throw new Error(
        (error as any).message || `HTTP error! status: ${response.status}`,
      );
    }

    // Handle empty responses (like DELETE operations that return 204 No Content)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null as T;
    }

    // Check if response has content
    const text = await response.text();
    if (!text) {
      return null as T;
    }

    return JSON.parse(text);
  }

  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  setTokens(tokens: AuthTokens): void {
    this.setAuthTokens(tokens);
  }

  clearTokens(): void {
    this.removeAuthTokens();
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

export const apiClient = new ApiClient(API_CONFIG.BASE_URL);
