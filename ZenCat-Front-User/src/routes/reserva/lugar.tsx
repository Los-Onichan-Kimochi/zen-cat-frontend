import { createFileRoute } from '@tanstack/react-router';
import { LocationStep } from '@/components/ui/reservation/location-step';
import { ReservaLugarRoute } from '@/layouts/reservation-layout';

export const Route = createFileRoute(ReservaLugarRoute)({
  component: LocationStep,
});
