import { createFileRoute } from '@tanstack/react-router';
import CommunityMembershipsLayout from '@/components/communities-membresias/CommunityMembershipsLayout';
// Crea una ruta para '/mis-comunidades/:communityId/membresias/historial'
export const Route = createFileRoute('/historial-membresias/$communityId')({
  component: CommunityMembershipsLayout,
});
