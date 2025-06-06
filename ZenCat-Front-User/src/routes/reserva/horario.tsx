import { createFileRoute } from '@tanstack/react-router';
import { ScheduleStep } from '@/components/ui/Reservation/ScheduleStep';
import { ReservaHorarioRoute } from '@/layouts/ReservationLayout';

export const Route = createFileRoute(ReservaHorarioRoute)({
  component: ScheduleStep,
});

