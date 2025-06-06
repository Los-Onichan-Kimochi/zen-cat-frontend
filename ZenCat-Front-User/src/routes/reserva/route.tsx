import { createFileRoute } from '@tanstack/react-router';
import ReservationLayout, {
  ReservaBaseRoute,
} from '@/layouts/ReservationLayout';

export const Route = createFileRoute(ReservaBaseRoute)({
  component: ReservationLayout,
});
