import { createFileRoute } from '@tanstack/react-router';
import { ReservaConfirmacionRoute } from '@/layouts/reservation-layout';
import { z } from 'zod';

export const Route = createFileRoute(ReservaConfirmacionRoute)({
  component: ConfirmationStepComponent,
  validateSearch: z.object({
    servicio: z.string().optional(), // Permite pasar un query param `servicio`
  }),
});

function ConfirmationStepComponent() {
  return (
    <div>
      <h1>Confirmación</h1>
    </div>
  );
}
