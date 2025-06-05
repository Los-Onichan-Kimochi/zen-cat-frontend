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
    <div className="flex flex-col gap-6 px-6 md:px-12 py-8">

      <div className="text-center">
        <h2 className="text-lg">Realizar una reserva</h2>
        <h1 className="text-2xl font-bold">Servicio</h1>
        <span className="text-muted">-</span> 
        {/* TODO: Add dynamic service name*/}
      </div>

      <ProgressBar currentStep={currentStep} steps={steps} />

      <div className="border p-4 rounded-md min-h-[200px]">
        <Outlet />
      </div>

      <div className="self-end">
        <ContinueButton
          label={currentStep < steps.length - 1 ? 'Continuar' : 'Finalizar'}
          nextRoute={stepRoutes[currentStep + 1]}
        />
      </div>
    </div>
  );
};

export default ReservationLayout;
