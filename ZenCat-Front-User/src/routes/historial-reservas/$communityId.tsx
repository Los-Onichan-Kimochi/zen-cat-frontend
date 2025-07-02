import { createFileRoute } from '@tanstack/react-router';
import CommunityReservasLayout from '@/components/CommunitiesReservas/CommunityReservasLayout';
// Crea una ruta para '/mis-comunidades/:communityId/reservas/historial'
export const Route = createFileRoute('/historial-reservas/$communityId')({
  component: CommunityReservasLayout,
});
