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
  onboardingData?: OnboardingData;
  paymentData?: PaymentData;
  currentStep: number;
} 