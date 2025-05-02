export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
  password: string;
  isAuthenticated: boolean;
  permissions?: string[];
  avatar?: string;
} 