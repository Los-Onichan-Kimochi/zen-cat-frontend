import React from 'react';
import { Outlet, useLocation } from '@tanstack/react-router';
import { ProgressBar } from '@/components/ui/progress-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

const queryClient = new QueryClient();

const ReservationLayout: React.FC = () => {
  const location = useLocation();
  let currentPath = location.pathname;
  if (currentPath[currentPath.length - 1] === '/') {
    currentPath = currentPath.slice(0, -1);
  }
  const currentStep = stepRoutes.indexOf(currentPath);

  const servicio = location.search?.servicio ?? null;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full flex justify-center px-4 md:px-6 py-10">
        <div className="w-full max-w-6xl flex flex-col gap-12">
          {/* Título centrado */}
          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-bold mb-2">Comunidad X</h1>
            <h2 className="text-xl md:text-xl font-semibold mb-5">
              Realiza una nueva reserva
            </h2>
            {/* Nombre de servicio dinámico */}
            <span className="text-2xl md:text-4xl font-bold">
              {servicio || '-'}
            </span>
          </div>

          {/* Progress bar centrada con ancho limitado */}
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <ProgressBar currentStep={currentStep} steps={steps} />
            </div>
          </div>

          {/* Contenido dinámico */}
          <Outlet />
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default ReservationLayout;
