import { createFileRoute } from '@tanstack/react-router';
import { ChangePasswordForm } from '@/components/custom/changepassw-form';

export const Route = createFileRoute('/changepassword')({
  component: ChangePasswordComponent,
});

function ChangePasswordComponent() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <ChangePasswordForm />
    </div>
  );
}
