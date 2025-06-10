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
    Cookies.set('access_token', tokens.access_token, {
      expires: tokens.expires_in ? tokens.expires_in / (24 * 60 * 60) : 1, // Convert seconds to days
      secure: window.location.protocol === 'https:',
      sameSite: 'strict'
    });
    Cookies.set('refresh_token', tokens.refresh_token, {
      expires: 7, // 7 days for refresh token
      secure: window.location.protocol === 'https:',
      sameSite: 'strict'
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
          'Authorization': `Bearer ${refreshToken}`
        }
      });

      if (response.ok) {
        const tokens: AuthTokens = await response.json();
        this.setAuthTokens(tokens);
        return tokens;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return null;
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
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

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
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