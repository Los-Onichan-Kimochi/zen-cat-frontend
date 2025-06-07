import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMembershipOnboarding } from '@/context/MembershipOnboardingContext';
import { useNavigate } from '@tanstack/react-router';

export function ConfirmationStep() {
  const { state, resetOnboarding, prevStep } = useMembershipOnboarding();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    
    // Simular procesamiento del pago
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsProcessing(false);
    setIsCompleted(true);
  };

  const handleGoHome = () => {
    resetOnboarding();
    navigate({ to: '/' });
  };

  if (isCompleted) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            {/* Ícono de éxito */}
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¡Felicitaciones!
            </h2>
            
            <p className="text-lg text-gray-600 mb-2">
              Tu membresía ha sido activada exitosamente
            </p>
            
            <p className="text-gray-500 mb-8">
              Ya puedes comenzar a disfrutar de todos los beneficios de tu plan {state.selectedPlan?.name} 
              en la comunidad {state.community?.name || 'Runners'}
            </p>

            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="font-semibold text-lg mb-4">Detalles de tu membresía</h3>
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium">{state.selectedPlan?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Comunidad:</span>
                  <span className="font-medium">{state.community?.name || 'Runners'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio:</span>
                  <span className="font-medium">S/ {state.selectedPlan?.price.toFixed(2)}{state.selectedPlan?.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha de inicio:</span>
                  <span className="font-medium">{new Date().toLocaleDateString('es-PE')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Próxima facturación:</span>
                  <span className="font-medium">
                    {new Date(Date.now() + (state.selectedPlan?.type === 'Mensual' ? 30 : 365) * 24 * 60 * 60 * 1000).toLocaleDateString('es-PE')}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Recibirás un correo de confirmación con todos los detalles de tu membresía.
              </p>
              
              <Button
                onClick={handleGoHome}
                className="w-full py-3 bg-black text-white hover:bg-gray-800"
              >
                Ir al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            {/* Spinner de carga */}
            <div className="w-16 h-16 mx-auto mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black"></div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Procesando tu pago
            </h2>
            
            <p className="text-gray-600 mb-8">
              Por favor espera mientras procesamos tu información...
            </p>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ No cierres esta ventana ni presiones el botón de retroceder del navegador
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Confirmar Membresía
          </CardTitle>
          <p className="text-center text-gray-600">
            Revisa los detalles antes de completar tu suscripción
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resumen del plan */}
          {state.selectedPlan && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">Resumen de tu membresía</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan seleccionado:</span>
                  <span className="font-medium">{state.selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Comunidad:</span>
                  <span className="font-medium">{state.community?.name || 'Runners'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium">{state.selectedPlan.type}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total a pagar:</span>
                  <span className="font-bold">S/ {state.selectedPlan.price.toFixed(2)}{state.selectedPlan.duration}</span>
                </div>
              </div>
            </div>
          )}

          {/* Información personal */}
          {state.onboardingData && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">Información personal</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Documento:</span>
                  <span>{state.onboardingData.documentType} {state.onboardingData.documentNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Teléfono:</span>
                  <span>{state.onboardingData.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ciudad:</span>
                  <span>{state.onboardingData.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Distrito:</span>
                  <span>{state.onboardingData.district}</span>
                </div>
              </div>
            </div>
          )}

          {/* Información de pago */}
          {state.paymentData && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">Método de pago</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">CARD</span>
                </div>
                <div>
                  <p className="font-medium">
                    •••• •••• •••• {state.paymentData.cardNumber.slice(-4)}
                  </p>
                  <p className="text-sm text-gray-600">{state.paymentData.cardholderName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Términos y condiciones */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-sm text-blue-900">
                  Al confirmar tu membresía, aceptas nuestros{' '}
                  <button className="underline font-medium">términos y condiciones</button>
                  {' '}y{' '}
                  <button className="underline font-medium">política de privacidad</button>.
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Tu membresía se renovará automáticamente. Puedes cancelar en cualquier momento desde tu perfil.
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-between pt-6">
            <Button
              onClick={prevStep}
              variant="outline"
              className="px-6 py-2"
              disabled={isProcessing}
            >
              Retroceder
            </Button>
            <Button
              onClick={handleConfirm}
              className="px-8 py-2 bg-black text-white hover:bg-gray-800"
              disabled={isProcessing}
            >
              Confirmar Membresía
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 