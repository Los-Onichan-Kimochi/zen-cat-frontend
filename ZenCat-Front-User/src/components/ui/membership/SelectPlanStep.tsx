import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MembershipPlan } from '@/types/membership';
import { useMembershipOnboarding } from '@/context/MembershipOnboardingContext';

interface SelectPlanStepProps {
  plans: MembershipPlan[];
}

export function SelectPlanStep({ plans }: SelectPlanStepProps) {
  const { state, setSelectedPlan, nextStep } = useMembershipOnboarding();
  const [activeTab, setActiveTab] = useState<'Mensual' | 'Anual'>('Mensual');

  const processedPlans = useMemo(() => {
    const monthly = plans
      .filter((p) => p.type === 'Mensual')
      .sort((a, b) => a.price - b.price);
    const annual = plans
      .filter((p) => p.type === 'Anual')
      .sort((a, b) => a.price - b.price);

    const newPlans: MembershipPlan[] = [];

    if (monthly.length > 0) {
      const basicMonthly = { ...monthly[0], name: 'Plan Básico' };
      newPlans.push(basicMonthly);
      if (monthly.length > 1) {
        const premiumMonthly = { ...monthly[1], name: 'Plan Premium' };
        newPlans.push(premiumMonthly);
      }
    }

    if (annual.length > 0) {
      const basicAnnual = { ...annual[0], name: 'Plan Básico' };
      newPlans.push(basicAnnual);
      if (annual.length > 1) {
        const premiumAnnual = { ...annual[1], name: 'Plan Premium' };
        newPlans.push(premiumAnnual);
      }
    }

    return newPlans;
  }, [plans]);

  useEffect(() => {
    if (state.selectedPlan && state.selectedPlan.type !== activeTab) {
      setSelectedPlan(null);
    }
  }, [activeTab]);

  const handlePlanSelect = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
  };

  const handleContinue = () => {
    if (state.selectedPlan) {
      nextStep();
    }
  };

  if (processedPlans.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="border-red-500 border-2">
          <CardHeader>
            <CardTitle className="text-red-600">
              No hay planes disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Esta comunidad no tiene planes configurados. Por favor, contacte
              al administrador.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-black text-white"
            >
              Recargar página
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedPlans = processedPlans
    .filter((plan) => plan.type === activeTab)
    .sort((a, b) => a.price - b.price);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            className={`px-8 py-2 rounded-md font-medium transition-all ${
              activeTab === 'Mensual'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
            onClick={() => setActiveTab('Mensual')}
          >
            Mensual
          </button>
          <button
            className={`px-8 py-2 rounded-md font-medium transition-all ${
              activeTab === 'Anual'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
            onClick={() => setActiveTab('Anual')}
          >
            Anual
          </button>
        </div>
      </div>

      {sortedPlans.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay planes {activeTab.toLowerCase()}s disponibles
          </h3>
          <p className="text-gray-600">
            Esta comunidad no tiene configurados planes{' '}
            {activeTab.toLowerCase()}s.
          </p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {sortedPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all duration-300 transform border-2 ${
                  state.selectedPlan?.id === plan.id
                    ? 'bg-black text-white border-black scale-105'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handlePlanSelect(plan)}
              >
                <CardHeader className="pb-4">
                  <CardTitle
                    className={`text-xl font-bold ${
                      state.selectedPlan?.id === plan.id
                        ? 'text-white'
                        : 'text-black'
                    }`}
                  >
                    {plan.name}
                  </CardTitle>
                  <div
                    className={`text-3xl font-bold ${
                      state.selectedPlan?.id === plan.id
                        ? 'text-white'
                        : 'text-black'
                    }`}
                  >
                    S/{' '}
                    {typeof plan.price === 'number'
                      ? plan.price.toFixed(2)
                      : 'Precio no disponible'}
                    <span className="text-lg font-normal">{plan.duration}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className={`flex items-start text-sm ${
                          state.selectedPlan?.id === plan.id
                            ? 'text-white'
                            : 'text-gray-700'
                        }`}
                      >
                        <span className="mr-3 mt-0.5">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <div className="flex justify-center">
        <Button
          onClick={handleContinue}
          disabled={!state.selectedPlan}
          className="px-8 py-3 bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
