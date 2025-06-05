import { createFileRoute } from '@tanstack/react-router';
import { LocationStep } from '@/components/ui/Reservation/LocationStep';  

export const Route = createFileRoute('/reserva/lugar')({
  component: LocationStep,
});
