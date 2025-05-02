import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/roles-permisos')({
  component: RolesPermisosComponent,
});

function RolesPermisosComponent() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Roles y Permisos</h1>
      <p>Aquí se gestionarán los roles y permisos.</p>
    </div>
  );
} 