import React from 'react';
import { Outlet, useMatch } from '@tanstack/react-router';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ContinueButton } from '@/components/ui/ContinueButton';

const steps = [
  'Seleccionar servicio',
  'Seleccionar lugar',
  'Seleccionar horario',
  'Confirmar reserva',
];

const stepRoutes = [
  '/reserva/servicio',
  '/reserva/lugar',
  '/reserva/horario',
  '/reserva/confirmacion',
];

const ReservationLayout: React.FC = () => {
  const currentMatch = useMatch({ strict: false });
  const currentPath = currentMatch.pathname;
  const currentStep = stepRoutes.indexOf(currentPath);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 px-6 md:px-16 py-12">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Realizar una reserva</h2>
        <h1 className="text-2xl font-bold">Servicio</h1>
        <span className="text-muted">-</span>
        {/* TODO: Add dynamic service name */}
      </div>

      <div className="w-full flex justify-center">
        <div className="w-full max-w-md">
          <ProgressBar currentStep={currentStep} steps={steps} />
        </div>
      </div>

      <div className="border p-4 rounded-md min-h-[200px] w-full">
        <div className="max-w-md mx-auto">
          <Outlet />
        </div>
      </div>

      <div className="self-center">
        <ContinueButton
          label={currentStep < steps.length - 1 ? 'Continuar' : 'Finalizar'}
          nextRoute={stepRoutes[currentStep + 1]}
        />
      </div>
    </div>
  );
};

export default ReservationLayout;
