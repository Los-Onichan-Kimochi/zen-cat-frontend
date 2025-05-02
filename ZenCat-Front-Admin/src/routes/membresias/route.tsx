import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/membresias')({
  component: MembresiasComponent,
});

function MembresiasComponent() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Membresías</h1>
      <p>Aquí se gestionarán las membresías de usuarios.</p>
    </div>
  );
} 