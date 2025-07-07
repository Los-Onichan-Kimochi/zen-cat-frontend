import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import ProfileSection from '@/components/ui/profile/ProfileSection';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <div className="bg-white">
        <ProfileSection />
      </div>
    </ProtectedRoute>
  );
}
