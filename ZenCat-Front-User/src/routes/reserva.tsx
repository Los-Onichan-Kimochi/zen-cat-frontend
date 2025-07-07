import { createFileRoute } from '@tanstack/react-router';
import ReservationLayout from '@/layouts/reservation-layout';

export const Route = createFileRoute('/reserva')({
  component: ReservationLayout,
}); 