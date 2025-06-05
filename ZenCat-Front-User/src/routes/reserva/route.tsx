import { createFileRoute } from '@tanstack/react-router';
import ReservationLayout from '@/layouts/ReservationLayout';

export const Route = createFileRoute('/reserva')({
  component: ReservationLayout,
});
