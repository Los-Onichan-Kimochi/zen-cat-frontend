import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/auditoria')({
  component: AuditoriaComponent,
});

function AuditoriaComponent() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Auditoría</h1>
      <p>Aquí se mostrará la información de auditoría.</p>
    </div>
  );
} 