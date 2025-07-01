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
  // Onboarding data fields
  onboarding?: {
    id?: string;
    documentType?: 'DNI' | 'FOREIGNER_CARD' | 'PASSPORT';
    documentNumber?: string;
    phoneNumber?: string;
    birthDate?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    city?: string;
    postalCode?: string;
    district?: string;
    address?: string;
    createdAt?: string;
    updatedAt?: string;
  };
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
  // Onboarding data fields for creation
  onboarding?: {
    documentType?: 'DNI' | 'FOREIGNER_CARD' | 'PASSPORT';
    documentNumber?: string;
    phoneNumber?: string;
    birthDate?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    city?: string;
    postalCode?: string;
    district?: string;
    address?: string;
  };
}

export type UpdateUserPayload = Partial<CreateUserPayload>;
