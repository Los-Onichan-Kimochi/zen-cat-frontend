import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/membresia')({
  component: MembresiaComponent,
});

function MembresiaComponent() {
  return (
    <div className="p-2">
      <h3>Membresía</h3>
      <p>Contenido de la página Membresía</p>
    </div>
  );
} 