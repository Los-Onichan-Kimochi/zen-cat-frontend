import { createFileRoute } from '@tanstack/react-router';
import { AdminSettingsPage } from '@/components/admin/AdminSettingsPage';

export const Route = createFileRoute('/admin/configuracion')({
  component: AdminConfiguracion,
});

function AdminConfiguracion() {
  return <AdminSettingsPage />;
} 