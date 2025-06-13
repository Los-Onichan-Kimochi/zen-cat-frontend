import { useEffect } from 'react';
import { StepIndicator } from './StepIndicator';
import { SelectPlanStep } from './SelectPlanStep';
import { OnboardingStep } from './OnboardingStep';
import { PaymentStep } from './PaymentStep';
import { ConfirmationStep } from './ConfirmationStep';
import { useMembershipOnboarding } from '@/context/MembershipOnboardingContext';
import { Community, MembershipPlan } from '@/types/membership';

interface MembershipOnboardingProps {
  community: Community;
  plans: MembershipPlan[];
}

export function MembershipOnboarding({
  community,
  plans,
}: MembershipOnboardingProps) {
  const { state, setCommunity } = useMembershipOnboarding();

  useEffect(() => {
    setCommunity(community);
  }, [community, setCommunity]);

  const stepLabels = [
    'Seleccionar plan',
    'Onboarding',
    'Datos de pago',
    'Confirmación',
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
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Adquiere tu membresía
          </h1>
          <p className="text-gray-600">Comunidad</p>
          <h2 className="text-2xl font-semibold text-gray-800">
            {community.name}
          </h2>
        </div>

        {/* Step Indicator */}
        <StepIndicator
          currentStep={state.currentStep}
          totalSteps={4}
          stepLabels={stepLabels}
        />

        {/* Current Step Content */}
        <div className="mt-8">{renderCurrentStep()}</div>
      </div>
    </div>
  );
}
