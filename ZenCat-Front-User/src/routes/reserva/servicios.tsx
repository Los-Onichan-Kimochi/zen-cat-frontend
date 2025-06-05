import { createFileRoute } from '@tanstack/react-router';
import { ServiceStep } from '@/components/ui/Reservation/ServiceStep';

export const Route = createFileRoute('/reserva/servicios')({
  component: ServiceStep,
});
