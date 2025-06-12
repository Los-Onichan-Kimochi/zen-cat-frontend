import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PaymentData } from '@/types/membership';
import { useMembershipOnboarding } from '@/context/MembershipOnboardingContext';

export function PaymentStep() {
  const { state, setPaymentData, nextStep, prevStep } = useMembershipOnboarding();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState<PaymentData>(
    state.paymentData || {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      billingAddress: ''
    }
  );

  const handleInputChange = (field: keyof PaymentData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContinue = async () => {
    setIsProcessing(true);
    
    // Simular procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setPaymentData(formData);
    setIsProcessing(false);
    nextStep();
  };

  const isFormValid = true; // Por ahora siempre válido para testing

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Resumen de compra - Columna izquierda */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumen de compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.selectedPlan && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Comunidad</span>
                      <span>Runners</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Plan</span>
                      <span>{state.selectedPlan.name} - {state.selectedPlan.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Duración</span>
                      <span>1 mes</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cantidad de reservas</span>
                      <span>{state.selectedPlan.reservationLimit || 'Ilimitadas'} reservas</span>
                    </div>
                    <hr className="my-4" />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>S/ {state.selectedPlan.price.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {state.onboardingData && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Nombre</span>
                        <span>Carlos Chavez</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>DNI</span>
                        <span>{state.onboardingData.documentNumber}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Formulario de pago - Columna derecha */}
        <div className="lg:col-span-2">
          {/* Pestañas de método de pago */}
          <div className="flex mb-6">
            <button className="px-6 py-2 bg-gray-100 text-black rounded-l-lg border border-gray-300">
              Tarjeta
            </button>
            <button className="px-6 py-2 bg-white text-gray-500 rounded-r-lg border border-l-0 border-gray-300">
              Paypal
            </button>
          </div>

          <Card>
            <CardContent className="p-6">
              {/* Icono de herramientas */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>

              <div className="text-center">
                {isProcessing ? (
                  <>
                    <div className="flex justify-center mb-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Procesando pago...
                    </p>
                  </>
                ) : (
                  <p className="text-gray-600 mb-6">
                    Implementación en progreso...
                  </p>
                )}
                
                <Button
                  onClick={handleContinue}
                  disabled={isProcessing}
                  className="w-full py-3 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400"
                >
                  {isProcessing ? 'Procesando...' : 'Pagar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 