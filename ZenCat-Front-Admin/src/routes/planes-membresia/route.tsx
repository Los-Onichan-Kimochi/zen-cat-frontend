import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/planes-membresia')({
  component: PlanesMembresiaComponent,
});

function PlanesMembresiaComponent() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Planes de Membresía</h1>
      <p>Aquí se gestionarán los planes de membresía.</p>
    </div>
  );
} 