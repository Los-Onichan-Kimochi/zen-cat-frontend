export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'user' | 'guest';
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in?: number;
}

export interface LoginResponse {
  user: BackendUser;
  tokens: AuthTokens;
}

export interface BackendUser {
  id: string;
  email: string;
  name: string;
  first_last_name?: string;
  second_last_name?: string;
  rol: string;
  image_url?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
  permissions?: string[];
  avatar?: string;
  address?: string;
  district?: string;
  phone?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in?: number;
}
