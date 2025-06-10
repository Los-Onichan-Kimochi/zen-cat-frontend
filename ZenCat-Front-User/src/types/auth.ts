export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  first_last_name: string;
  second_last_name: string;
  email: string;
  password: string;
  image_url?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in?: number;
}

export interface BackendUser {
  id: string;
  name: string;
  first_last_name: string;
  second_last_name: string;
  email: string;
  rol: string;
  image_url?: string;
}

export interface LoginResponse {
  user: BackendUser;
  tokens: AuthTokens;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in?: number;
}

// Frontend user interface (adapted from existing User interface)
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'client' | 'admin';
  isAuthenticated: boolean;
  permissions?: string[];
  avatar?: string;
  imageUrl?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
} 