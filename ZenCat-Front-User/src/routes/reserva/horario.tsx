import { createFileRoute } from '@tanstack/react-router';
import { ScheduleStep } from '@/components/ui/Reservation/ScheduleStep';  

export const Route = createFileRoute('/reserva/horario')({
  component: ScheduleStep,
});
