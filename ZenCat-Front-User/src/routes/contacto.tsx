import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/contacto')({
  component: ContactoComponent,
});

function ContactoComponent() {
  return (
    <div className="p-2">
      <h3>Contacto</h3>
      <p>Contenido de la página Contacto</p>
    </div>
  );
} 