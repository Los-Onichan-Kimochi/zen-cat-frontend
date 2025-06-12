import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMembershipOnboarding } from '@/context/MembershipOnboardingContext';
import { useNavigate } from '@tanstack/react-router';

export function ConfirmationStep() {
  const { state, resetOnboarding } = useMembershipOnboarding();
  const navigate = useNavigate();

  // Generar ID estático al montar el componente
  const [transactionData] = useState(() => {
    const now = Date.now();
    return {
      transactionId: `TXN${now.toString().slice(-6)}`,
      startDate: new Date().toLocaleDateString('es-PE'),
      endDate: new Date(now + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
        'es-PE',
      ),
    };
  });

  const handleGoToCommunities = () => {
    resetOnboarding();
    navigate({ to: '/comunidades' });
  };

  const handleDownloadReceipt = () => {
    // Aquí implementarías la descarga del comprobante
    console.log('Descargando comprobante...');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="border-2 border-gray-200">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            Compra realizada
          </CardTitle>
          <p className="text-gray-600">
            Tu membresía se ha activado correctamente
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          {/* Tabla de detalles */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna izquierda */}
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Comunidad</span>
                  <span>Runners</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Plan</span>
                  <span>
                    {state.selectedPlan?.name} - {state.selectedPlan?.type}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Duración</span>
                  <span>1 mes</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Cantidad de reservas</span>
                  <span>
                    {state.selectedPlan?.reservationLimit || 'Ilimitadas'}{' '}
                    reservas
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Fecha de inicio</span>
                  <span>{transactionData.startDate}</span>
                </div>
              </div>

              {/* Columna derecha */}
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Nombre</span>
                  <span>Carlos Chavez</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">DNI</span>
                  <span>
                    {state.onboardingData?.documentNumber || '77677420'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">ID de transacción</span>
                  <span>{transactionData.transactionId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-lg">Total</span>
                  <span className="font-bold text-lg">
                    S/ {state.selectedPlan?.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Fecha de fin</span>
                  <span>{transactionData.endDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mensaje de bienvenida */}
          <div className="text-center mb-8">
            <p className="text-lg font-semibold text-black mb-2">
              ¡Bienvenido a Astrocat!
            </p>
            <p className="text-gray-600">
              Ya puedes empezar a disfrutar de todos los beneficios de tu
              membresía
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGoToCommunities}
              className="px-8 py-3 bg-black text-white hover:bg-gray-800"
            >
              Ir a mis comunidades
            </Button>
            <Button
              onClick={handleDownloadReceipt}
              variant="outline"
              className="px-8 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Descargar boleta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
