import { createFileRoute } from '@tanstack/react-router';
import ProfileSection from '@/components/ui/profile/ProfileSection.tsx';

export const Route = createFileRoute('/profile')({
    component: ProfileComponent,
});

export function ProfileComponent() {
    return (
        <div className="bg-white">
            <ProfileSection />
        </div>
    );
}
