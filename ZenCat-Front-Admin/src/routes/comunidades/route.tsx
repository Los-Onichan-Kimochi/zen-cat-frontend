import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/comunidades')({
  component: ComunidadesComponent,
});

function ComunidadesComponent() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Comunidades</h1>
      <p>Aquí se gestionarán las comunidades.</p>
    </div>
  );
} 