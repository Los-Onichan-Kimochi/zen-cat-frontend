import { createFileRoute } from '@tanstack/react-router';
import { ReservaHorarioRoute } from '@/layouts/reservation-layout';
import { z } from 'zod';

export const Route = createFileRoute(ReservaHorarioRoute)({
  component: ScheduleStepComponent,
  validateSearch: z.object({
    servicio: z.string().optional(), // Permite pasar un query param `servicio`
  }),
});

function ScheduleStepComponent() {
  return (
    <div>
      <h1>Horario</h1>
    </div>
  );
}
