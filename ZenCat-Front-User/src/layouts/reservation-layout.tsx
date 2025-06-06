import React from 'react';
import { Outlet, useLocation } from '@tanstack/react-router';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ContinueButton } from '@/components/ui/ContinueButton';

const steps = [
  'Seleccionar servicio',
  'Seleccionar lugar',
  'Seleccionar horario',
  'Confirmar reserva',
];

export const ReservaBaseRoute = '/reserva';
export const ReservaServiciosRoute = '/reserva/servicios';
export const ReservaLugarRoute = '/reserva/lugar';
export const ReservaHorarioRoute = '/reserva/horario';
export const ReservaConfirmacionRoute = '/reserva/confirmacion';

const stepRoutes = [
  ReservaServiciosRoute,
  ReservaLugarRoute,
  ReservaHorarioRoute,
  ReservaConfirmacionRoute,
];

const ReservationLayout: React.FC = () => {
  const location = useLocation();
  let currentPath = location.pathname;
  if (currentPath[currentPath.length - 1] === '/') {
    currentPath = currentPath.slice(0, -1);
  }
  const currentStep = stepRoutes.indexOf(currentPath);

  return (
    <div className="w-full flex justify-center px-4 md:px-6 py-10">
      <div className="w-full max-w-6xl flex flex-col gap-12">
        {/* Título centrado */}
        <div className="text-center">
          <h1 className="text-lg md:text-xl mb-2">Realiza una nueva reserva</h1>
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Servicio</h1>
          {/* Nombre de servicio dinámico */}
          <span className="text-lg font-bold">-</span>
        </div>

        {/* Progress bar centrada con ancho limitado */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <ProgressBar currentStep={currentStep} steps={steps} />
          </div>
        </div>

        {/* Contenido dinámico centrado */}
        <div className="border p-6 rounded-md min-h-[430px] w-full">
          <div className="max-w-4xl mx-auto">
            <Outlet />
          </div>
        </div>

        {/* Botón centrado */}
        <div className="flex justify-center">
          <ContinueButton
            label={currentStep < steps.length - 1 ? 'Continuar' : 'Finalizar'}
            nextRoute={stepRoutes[currentStep + 1]}
          />
        </div>
      </div>
    </div>
  );
};

export default ReservationLayout;
