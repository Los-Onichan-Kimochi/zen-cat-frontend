export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
  password: string;
  isAuthenticated: boolean;
  permissions?: string[];
  avatar?: string;
  address?: string;
  district?: string;
  phone?: string;
}

export interface CreateUserPayload {
  email: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
  password: string;
  permissions?: string[];
  avatar?: string;
  address?: string;
  district?: string;
  phone?: string;
}

export type UpdateUserPayload = Partial<CreateUserPayload>; 