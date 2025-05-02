import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/log-errores')({
  component: LogErroresComponent,
});

function LogErroresComponent() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Log de Errores</h1>
      <p>Aquí se mostrará el log de errores.</p>
    </div>
  );
} 