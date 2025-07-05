import { createFileRoute } from '@tanstack/react-router';
import CommunityPage from '@/components/communities-noauth/CommunityPage';

export const Route = createFileRoute('/comunidades/$communityId')({
  component: () => {
    const { communityId } = Route.useParams();
    return <CommunityPage key={communityId} />;
  },
});
