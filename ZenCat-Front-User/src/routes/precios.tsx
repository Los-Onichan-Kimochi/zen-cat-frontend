import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/precios')({
  component: PreciosComponent,
});

function PreciosComponent() {
  return (
    <div className="p-2">
      <h3>Precios</h3>
      <p>Contenido de la página Precios</p>
    </div>
  );
} 