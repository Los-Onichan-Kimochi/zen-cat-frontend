import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/profesionales')({
  component: ProfesionalesComponent,
});

function ProfesionalesComponent() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Profesionales</h1>
      <p>Aquí se gestionarán los profesionales.</p>
    </div>
  );
} 