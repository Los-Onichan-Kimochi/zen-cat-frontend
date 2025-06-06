import { createFileRoute } from '@tanstack/react-router';
import { ReservaLugarRoute } from '@/layouts/reservation-layout';
import { z } from 'zod';

export const Route = createFileRoute(ReservaLugarRoute)({
  component: LocationStepComponent,
  validateSearch: z.object({
    servicio: z.string().optional(), // Permite pasar un query param `servicio`
  }),
});

function LocationStepComponent() {
  return (
    <div>
      <h1>Lugar</h1>
    </div>
  );
}
