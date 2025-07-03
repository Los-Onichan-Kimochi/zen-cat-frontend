import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MembershipPlan } from '@/types/membership';
import { useMembershipOnboarding } from '@/context/MembershipOnboardingContext';

interface SelectPlanStepProps {
  plans: MembershipPlan[];
}

interface PlanValidation {
  isComplete: boolean;
  missing: string[];
  hasBasicMonthly: boolean;
  hasPremiumMonthly: boolean;
  hasBasicAnnual: boolean;
  hasPremiumAnnual: boolean;
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

  // Función para validar si los planes están completos
  const validatePlans = useMemo((): PlanValidation => {
    
    const monthlyPlans = plans.filter(plan => plan.type === 'Mensual');
    const annualPlans = plans.filter(plan => plan.type === 'Anual');

    // NUEVA LÓGICA: Identificar básico vs premium por PRECIO
    // El plan más caro = Premium, el más barato = Básico
    
    // Para planes mensuales
    const hasBasicMonthly = monthlyPlans.length >= 2;
    const hasPremiumMonthly = monthlyPlans.length >= 2;
    
    // Para planes anuales  
    const hasBasicAnnual = annualPlans.length >= 2;
    const hasPremiumAnnual = annualPlans.length >= 2;

    // Si solo hay 1 plan mensual o anual, consideramos que falta el otro
    const actualBasicMonthly = monthlyPlans.length >= 1;
    const actualPremiumMonthly = monthlyPlans.length >= 2;
    const actualBasicAnnual = annualPlans.length >= 1;
    const actualPremiumAnnual = annualPlans.length >= 2;

    const missing: string[] = [];
    if (!actualBasicMonthly) missing.push('Plan Básico Mensual');
    if (!actualPremiumMonthly) missing.push('Plan Premium Mensual');
    if (!actualBasicAnnual) missing.push('Plan Básico Anual');
    if (!actualPremiumAnnual) missing.push('Plan Premium Anual');

    // Requiere todos los 4 planes (2 mensuales + 2 anuales)
    const isComplete = monthlyPlans.length >= 2 && annualPlans.length >= 2;

    console.log('📊 Plan analysis by price:', {
      monthlyPlans: monthlyPlans.map(p => ({ name: p.name, price: p.price })).sort((a, b) => a.price - b.price),
      annualPlans: annualPlans.map(p => ({ name: p.name, price: p.price })).sort((a, b) => a.price - b.price),
      isComplete,
      missing
    });

    return {
      isComplete,
      missing,
      hasBasicMonthly: actualBasicMonthly,
      hasPremiumMonthly: actualPremiumMonthly,
      hasBasicAnnual: actualBasicAnnual,
      hasPremiumAnnual: actualPremiumAnnual,
    };
  }, [plans]);

  // Usar validación completa de planes

  // Validación de planes - si no hay planes del backend, error crítico
  if (plans.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="border-red-500 border-2">
          <CardHeader>
            <CardTitle className="text-red-600">No hay planes disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Esta comunidad no tiene planes configurados. Por favor, contacte al administrador.
            </p>
            <Button onClick={() => window.location.reload()} className="bg-black text-white">
              Recargar página
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // SIEMPRE usar planes del backend
  const plansToShow = plans;
  const filteredPlans = plansToShow.filter((plan) => plan.type === activeTab);

  // Organizar planes por precio: básico (más barato) primero, premium (más caro) después
  const sortedPlans = filteredPlans.sort((a, b) => a.price - b.price);

  console.log('📊 Plans for', activeTab, 'tab:', filteredPlans.length, '| Validation:', validatePlans.isComplete ? '✅ Complete' : `❌ Missing: ${validatePlans.missing.join(', ')}`);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Mensaje informativo cuando los planes no están completos */}
      {!validatePlans.isComplete && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Configuración de planes incompleta
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Esta comunidad necesita configurar todos sus planes para ofrecer una experiencia completa.</p>
                <p className="mt-1"><strong>Planes faltantes:</strong> {validatePlans.missing.join(', ')}</p>
                <p className="mt-1 text-xs">💡 Los administradores pueden configurar estos planes desde el panel de administración.</p>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Mostrar mensaje si no hay planes para la pestaña activa */}
      {sortedPlans.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay planes {activeTab.toLowerCase()}s disponibles
          </h3>
          <p className="text-gray-600">
            Esta comunidad no tiene configurados planes {activeTab.toLowerCase()}s.
          </p>
        </div>
      ) : (
        <>
          {/* Planes */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {sortedPlans.map((plan) => (
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
        </>
      )}

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
