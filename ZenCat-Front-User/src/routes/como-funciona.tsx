import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/como-funciona')({
  component: ComoFuncionaComponent,
});

function ComoFuncionaComponent() {
  return (
    <div className="p-2">
      <h3>¿Cómo funciona?</h3>
      <p>Contenido de la página ¿Cómo funciona?</p>
    </div>
  );
} 