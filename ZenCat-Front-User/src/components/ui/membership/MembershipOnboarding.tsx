import React, { useEffect } from 'react';
import { StepIndicator } from './StepIndicator';
import { SelectPlanStep } from './SelectPlanStep';
import { OnboardingStep } from './OnboardingStep';
import { PaymentStep } from './PaymentStep';
import { ConfirmationStep } from './ConfirmationStep';
import { useMembershipOnboarding } from '@/context/MembershipOnboardingContext';
import { Community, MembershipPlan } from '@/types/membership';
import { Link } from '@tanstack/react-router';

interface MembershipOnboardingProps {
  community?: Community;
  plans?: MembershipPlan[];
}

export function MembershipOnboarding({ community, plans = [] }: MembershipOnboardingProps) {
  const { state, setCommunity } = useMembershipOnboarding();

  useEffect(() => {
    if (community) {
      setCommunity(community);
    }
  }, [community, setCommunity]);

  const stepLabels = [
    'Seleccionar plan',
    'Onboarding',
    'Datos de pago',
    'Confirmación'
  ];

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 1:
        return <SelectPlanStep plans={plans} />;
      case 2:
        return <OnboardingStep />;
      case 3:
        return <PaymentStep />;
      case 4:
        return <ConfirmationStep />;
      default:
        return <SelectPlanStep plans={plans} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Botón retroceder */}
          <div className="flex items-center mb-6">
            <Link 
              to="/"
              className="flex items-center text-gray-600 hover:text-black transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retroceder
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Adquiere tu membresía
          </h1>
          
          <div className="mb-6">
            <h2 className="text-xl text-gray-600 mb-2">Comunidad</h2>
            <h3 className="text-4xl font-bold text-black">
              {community?.name || 'Runners'}
            </h3>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator
          currentStep={state.currentStep}
          totalSteps={4}
          stepLabels={stepLabels}
        />

        {/* Current Step Content */}
        <div className="flex justify-center">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
} 