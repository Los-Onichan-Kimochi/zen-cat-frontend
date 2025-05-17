import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/signup')({
  component: SignupComponent,
});

function SignupComponent() {
  return (
    <div className="p-2">
      <h3>Comienza ahora</h3>
      <p>Contenido de la página de registro</p>
    </div>
  );
} 