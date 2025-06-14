import { createFileRoute } from '@tanstack/react-router';
import ReservationLayout, {
  ReservaBaseRoute,
} from '@/layouts/reservation-layout';

export const Route = createFileRoute(ReservaBaseRoute)({
  component: ReservationLayout,
});
