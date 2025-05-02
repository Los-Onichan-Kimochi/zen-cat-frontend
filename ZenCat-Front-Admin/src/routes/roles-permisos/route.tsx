import HeaderDescriptor from '@/components/common/header-descriptor';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/roles-permisos')({
  component: RolesPermisosComponent,
});

function RolesPermisosComponent() {
  return (
    <div className="p-6 h-full">
      <HeaderDescriptor title="ROLES Y PERMISOS" subtitle="LISTADO DE ROLES Y PERMISOS" />
    </div>
  );
} 