import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/profile')({
  beforeLoad: () => {
    // Redirect to admin configuration page
    throw redirect({
      to: '/admin/configuracion',
    });
  },
  component: () => null, // This component will never render due to redirect
}); 