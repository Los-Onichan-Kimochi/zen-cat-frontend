import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  MembershipOnboardingState,
  MembershipPlan,
  PaymentData,
  Community,
} from '@/types/membership';
import { CreateOnboardingRequest } from '@/types/onboarding';

interface MembershipOnboardingContextType {
  state: MembershipOnboardingState;
  setSelectedPlan: (plan: MembershipPlan | null) => void;
  setOnboardingData: (data: CreateOnboardingRequest) => void;
  setPaymentData: (data: PaymentData) => void;
  setCommunity: (community: Community) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetOnboarding: () => void;
}

const MembershipOnboardingContext = createContext<
  MembershipOnboardingContextType | undefined
>(undefined);

interface MembershipOnboardingProviderProps {
  children: ReactNode;
}

export function MembershipOnboardingProvider({
  children,
}: MembershipOnboardingProviderProps) {
  const [state, setState] = useState<MembershipOnboardingState>({
    currentStep: 1,
  });

  const setSelectedPlan = (plan: MembershipPlan | null) => {
    setState((prev) => ({ ...prev, selectedPlan: plan || undefined }));
  };

  const setOnboardingData = (data: CreateOnboardingRequest) => {
    setState((prev) => ({ ...prev, onboardingData: data }));
  };

  const setPaymentData = (data: PaymentData) => {
    setState((prev) => ({ ...prev, paymentData: data }));
  };

  const setCommunity = (community: Community) => {
    setState((prev) => ({ ...prev, community }));
  };

  const nextStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 4),
    }));
  };

  const prevStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  };

  const goToStep = (step: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(1, Math.min(step, 4)),
    }));
  };

  const resetOnboarding = () => {
    setState({
      currentStep: 1,
    });
  };

  const value: MembershipOnboardingContextType = {
    state,
    setSelectedPlan,
    setOnboardingData,
    setPaymentData,
    setCommunity,
    nextStep,
    prevStep,
    goToStep,
    resetOnboarding,
  };

  return (
    <MembershipOnboardingContext.Provider value={value}>
      {children}
    </MembershipOnboardingContext.Provider>
  );
}

export function useMembershipOnboarding() {
  const context = useContext(MembershipOnboardingContext);
  if (context === undefined) {
    throw new Error(
      'useMembershipOnboarding must be used within a MembershipOnboardingProvider',
    );
  }
  return context;
}
