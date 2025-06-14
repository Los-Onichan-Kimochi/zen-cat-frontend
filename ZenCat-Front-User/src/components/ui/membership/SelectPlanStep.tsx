import React, { useState } from 'react';
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

  const handlePlanSelect = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
  };

  const handleContinue = () => {
    if (state.selectedPlan) {
      nextStep();
    }
  };

  // Datos de ejemplo para los planes
  const allPlans: MembershipPlan[] = [
    // Planes Mensuales
    {
      id: '1',
      name: 'Plan básico',
      type: 'Mensual',
      price: 159.9,
      duration: '/mes',
      features: [
        'Acceso a una comunidad',
        'Realiza 20 reservas al mes',
        'Recibe notificaciones',
        'Consulta tu historial de reservas',
        'Puedes desactivar tu membresía desde el perfil',
      ],
      reservationLimit: 20,
    },
    {
      id: '2',
      name: 'Plan premium',
      type: 'Mensual',
      price: 199.9,
      duration: '/mes',
      features: [
        'Acceso a una comunidad',
        'Realiza un número ilimitado de reservas al mes',
        'Recibe notificaciones',
        'Consulta tu historial de reservas',
        'Puedes desactivar tu membresía desde el perfil',
        'Acceso prioritario a eventos especiales',
      ],
    },
    // Planes Anuales
    {
      id: '3',
      name: 'Plan básico',
      type: 'Anual',
      price: 1599.9,
      duration: '/año',
      features: [
        'Acceso a una comunidad',
        'Realiza 20 reservas al mes',
        'Recibe notificaciones',
        'Consulta tu historial de reservas',
        'Puedes desactivar tu membresía desde el perfil',
        '2 meses gratis comparado al plan mensual',
      ],
      reservationLimit: 20,
    },
    {
      id: '4',
      name: 'Plan premium',
      type: 'Anual',
      price: 1999.9,
      duration: '/año',
      features: [
        'Acceso a una comunidad',
        'Realiza un número ilimitado de reservas al mes',
        'Recibe notificaciones',
        'Consulta tu historial de reservas',
        'Puedes desactivar tu membresía desde el perfil',
        'Acceso prioritario a eventos especiales',
        '2 meses gratis comparado al plan mensual',
      ],
    },
  ];

  const plansToShow = plans.length > 0 ? plans : allPlans;
  const filteredPlans = plansToShow.filter((plan) => plan.type === activeTab);

  // Debug logs
  console.log('Active tab:', activeTab);
  console.log('All plans:', plansToShow);
  console.log('Filtered plans:', filteredPlans);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Pestañas */}
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

      {/* Planes */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {filteredPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`cursor-pointer transition-all duration-300 border-2 ${
              state.selectedPlan?.id === plan.id
                ? 'bg-black text-white border-black'
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
                S/ {plan.price.toFixed(2)}
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

      {/* Botón continuar */}
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
