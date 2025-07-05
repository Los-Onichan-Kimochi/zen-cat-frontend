import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PaymentData } from '@/types/membership';
import { useMembershipOnboarding } from '@/context/MembershipOnboardingContext';
import YapeImg from '@/assets/yape.png';
import PlinImg from '@/assets/plin.png';

export function PaymentStep() {
  const { state, setPaymentData, nextStep, prevStep } =
    useMembershipOnboarding();

  // Método de pago seleccionado: 'Tarjeta', 'Yape', 'Plin'
  const [paymentMethod, setPaymentMethod] = useState<'Tarjeta' | 'Yape' | 'Plin'>('Tarjeta');

  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState<PaymentData>(
    state.paymentData || {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      billingAddress: '',
    },
  );

  const handleInputChange = (field: keyof PaymentData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContinue = async () => {
    setIsProcessing(true);

    // Simular procesamiento de pago
    await new Promise((resolve) => setTimeout(resolve, 2000));

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
                      <span>
                        {state.selectedPlan.name} - {state.selectedPlan.type}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Duración</span>
                      <span>1 mes</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cantidad de reservas</span>
                      <span>
                        {state.selectedPlan.reservationLimit || 'Ilimitadas'}{' '}
                        reservas
                      </span>
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
                        <span>{state.onboardingData.document_number}</span>
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
            {(['Tarjeta', 'Yape', 'Plin'] as const).map((method, idx) => (
              <button
                key={method}
                className={`px-6 py-2 border border-gray-300 first:rounded-l-lg last:rounded-r-lg -ml-px ${
                  paymentMethod === method
                    ? 'bg-gray-100 text-black'
                    : 'bg-white text-gray-500 hover:text-black'
                } ${idx === 0 ? 'border-l' : ''}`}
                onClick={() => setPaymentMethod(method)}
              >
                {method}
              </button>
            ))}
          </div>

          <Card>
            <CardContent className="p-6">
              {paymentMethod === 'Tarjeta' && (
                <div className="space-y-6">
                  {/* Icono de tarjeta grande */}
                  <div className="flex justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-20 w-20 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 7H21M3 11H21M6 15H6.01M9 15H9.01M12 15H12.01M15 15H15.01M18 15H18.01M3 18H21C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V18"
                      />
                    </svg>
                  </div>
                  {/* Formulario simple de tarjeta */}
                  <Input
                    placeholder="Número de tarjeta"
                    value={formData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="MM/AA"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    />
                    <Input
                      placeholder="CVV"
                      value={formData.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value)}
                    />
                  </div>
                  <Input
                    placeholder="Nombre del titular"
                    value={formData.cardholderName}
                    onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  />
                </div>
              )}

              {paymentMethod !== 'Tarjeta' && (
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <img
                      src={paymentMethod === 'Yape' ? YapeImg : PlinImg}
                      alt={paymentMethod}
                      className="w-100 h-auto rounded-lg shadow"
                    />
                  </div>
                  <p className="text-gray-600">
                    Escanee el código QR con {paymentMethod} y confirme su envío.
                  </p>
                </div>
              )}

              <div className="text-center mt-8">
                {isProcessing ? (
                  <div className="flex justify-center mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                  </div>
                ) : null}

                <Button
                  onClick={handleContinue}
                  disabled={isProcessing}
                  className="w-full py-3 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400"
                >
                  {isProcessing ? 'Procesando...' : 'Confirmar pago'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
