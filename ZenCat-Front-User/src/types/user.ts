export interface UserOnboarding {
  id: string;
  document_type: 'DNI' | 'FOREIGNER_CARD' | 'PASSPORT';
  document_number: string;
  phone_number: string;
  birth_date: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  city: string;
  postal_code: string;
  district: string;
  address: string;
}

export interface MembershipPlan {
  id: string;
  type: 'MONTHLY' | 'ANNUAL';
  fee: number;
  reservation_limit: number;
}

export interface Community {
  id: string;
  name: string;
  purpose: string;
  image_url: string;
  number_subscriptions: number;
}

export interface Membership {
  id: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  community: Community;
  plan: MembershipPlan;
}

export interface UserWithMemberships {
  id: string;
  email: string;
  name: string;
  first_last_name: string;
  second_last_name: string;
  password: string;
  image_url: string;
  rol: 'ADMINISTRATOR' | 'USER';
  onboarding: UserOnboarding;
  memberships: Membership[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'DNI' | 'FOREIGNER_CARD' | 'PASSPORT';
  password: string;
  isAuthenticated: boolean;
  permissions?: string[];
  avatar?: string;
}

export interface UpdateUserRequest {
  id?: string;
  email?: string;
  name?: string;
  role?: 'DNI' | 'FOREIGNER_CARD' | 'PASSPORT';
  password?: string;
  isAuthenticated?: boolean;
  permissions?: string[];
  avatar?: string;
}


