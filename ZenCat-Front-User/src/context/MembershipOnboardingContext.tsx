import { createContext, useContext, useState, ReactNode } from 'react';
import { MembershipOnboardingState, Community, MembershipPlan, OnboardingData, PaymentData } from '@/types/membership';

interface MembershipOnboardingContextType {
  state: MembershipOnboardingState;
  setCommunity: (community: Community) => void;
  setSelectedPlan: (plan: MembershipPlan) => void;
  setOnboardingData: (data: OnboardingData) => void;
  setPaymentData: (data: PaymentData) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetOnboarding: () => void;
}

const MembershipOnboardingContext = createContext<MembershipOnboardingContextType | undefined>(undefined);

interface MembershipOnboardingProviderProps {
  children: ReactNode;
}

export function MembershipOnboardingProvider({ children }: MembershipOnboardingProviderProps) {
  const [state, setState] = useState<MembershipOnboardingState>({
    currentStep: 1,
  });

  const setCommunity = (community: Community) => {
    setState(prev => ({ ...prev, community }));
  };

  const setSelectedPlan = (selectedPlan: MembershipPlan) => {
    setState(prev => ({ ...prev, selectedPlan }));
  };

  const setOnboardingData = (onboardingData: OnboardingData) => {
    setState(prev => ({ ...prev, onboardingData }));
  };

  const setPaymentData = (paymentData: PaymentData) => {
    setState(prev => ({ ...prev, paymentData }));
  };

  const nextStep = () => {
    setState(prev => ({ 
      ...prev, 
      currentStep: Math.min(prev.currentStep + 1, 4) 
    }));
  };

  const prevStep = () => {
    setState(prev => ({ 
      ...prev, 
      currentStep: Math.max(prev.currentStep - 1, 1) 
    }));
  };

  const resetOnboarding = () => {
    setState({
      currentStep: 1,
    });
  };

  return (
    <MembershipOnboardingContext.Provider
      value={{
        state,
        setCommunity,
        setSelectedPlan,
        setOnboardingData,
        setPaymentData,
        nextStep,
        prevStep,
        resetOnboarding,
      }}
    >
      {children}
    </MembershipOnboardingContext.Provider>
  );
}

export function useMembershipOnboarding(): MembershipOnboardingContextType {
  const context = useContext(MembershipOnboardingContext);
  if (!context) {
    throw new Error('useMembershipOnboarding debe usarse dentro de MembershipOnboardingProvider');
  }
  return context;
} 