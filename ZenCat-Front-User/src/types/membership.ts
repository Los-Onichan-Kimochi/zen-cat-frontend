export interface MembershipPlan {
  id: string;
  name: string;
  type: 'Mensual' | 'Anual';
  price: number;
  duration: string;
  features: string[];
  reservationLimit?: number;
  description?: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  image?: string;
  membershipPlans: MembershipPlan[];
}

export interface OnboardingData {
  documentType?: 'DNI' | 'FOREIGNER_CARD' | 'PASSPORT';
  documentNumber?: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  city?: string;
  postalCode?: string;
  district?: string;
  address?: string;
}

export interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  billingAddress?: string;
}

export interface MembershipOnboardingState {
  community?: Community;
  selectedPlan?: MembershipPlan;
  onboardingData?: import('@/types/onboarding').CreateOnboardingRequest;
  paymentData?: PaymentData;
  currentStep: number;
}

// Tipos para el API de membresía
export interface Membership {
  id: string;
  description: string;
  start_date: string;
  end_date: string;
  status: MembershipState;
  reservations_used?: number | null;
  
  community: {
    id: string;
    name: string;
    purpose: string;
    image_url: string;
    number_subscriptions: number;
  };
  plan: {
    id: string;
    type: 'MONTHLY' | 'ANNUAL';
    fee: number;
    reservation_limit: number;
  };
}

export enum MembershipState {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface MembershipsResponse {
  memberships: Membership[];
  total: number;
}

export interface CreateMembershipRequest {
  community_id: string;
  plan_id: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  reservations_used?: number | null;
}

export type UpdateMembershipRequest = Partial<CreateMembershipRequest>;