import { createFileRoute } from '@tanstack/react-router';
import { ChangePasswordForm } from '@/components/custom/changepassw-form';

export const Route = createFileRoute('/pin')({
  component: PinComponent,
});

function PinComponent() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <ChangePasswordForm />
    </div>
  );
}