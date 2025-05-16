import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/comunidades')({
  component: ComunidadesComponent,
});

function ComunidadesComponent() {
  return (
    <div className="p-2">
      <h3>Comunidades</h3>
      <p>Contenido de la página Comunidades</p>
    </div>
  );
} 