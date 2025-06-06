import { createFileRoute } from '@tanstack/react-router';
import { ScheduleStep } from '@/components/ui/reservation/schedule-step';
import { ReservaHorarioRoute } from '@/layouts/reservation-layout';

export const Route = createFileRoute(ReservaHorarioRoute)({
  component: ScheduleStep,
});
