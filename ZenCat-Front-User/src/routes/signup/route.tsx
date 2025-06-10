import { createFileRoute } from '@tanstack/react-router';
import { SignupForm } from '@/components/custom/signup-form';
import { GuestOnlyRoute } from '@/components/auth/GuestOnlyRoute';

export const Route = createFileRoute('/signup')({
  component: SignupComponent,
});

export function SignupComponent() {
  return (
    <GuestOnlyRoute>
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <SignupForm />
      </div>
    </GuestOnlyRoute>
  );
} 