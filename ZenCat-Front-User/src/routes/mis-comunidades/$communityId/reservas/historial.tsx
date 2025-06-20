import { createFileRoute } from '@tanstack/react-router';
import CommunityReservasLayout from '../../../../components/CommunitiesReservas/CommunityReservasLayout';  // Importa el componente correctamente

// Crea una ruta para '/mis-comunidades/:communityId/reservas/historial'
export const Route = createFileRoute('/mis-comunidades/$communityId/reservas/historial')({
  component: CommunityReservasLayout,
});
