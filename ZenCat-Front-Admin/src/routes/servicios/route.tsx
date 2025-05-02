import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/servicios')({
  component: ServiciosComponent,
});

function ServiciosComponent() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Servicios</h1>
      <p>Aquí se gestionarán los servicios.</p>
    </div>
  );
} 