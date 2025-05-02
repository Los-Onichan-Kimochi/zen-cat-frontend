import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/sesiones')({
  component: SesionesComponent,
});

function SesionesComponent() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Sesiones</h1>
      <p>Aquí se gestionarán las sesiones.</p>
    </div>
  );
} 