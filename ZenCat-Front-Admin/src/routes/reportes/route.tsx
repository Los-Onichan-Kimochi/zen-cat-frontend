import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/reportes')({
  component: ReportesComponent,
});

function ReportesComponent() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Reportes</h1>
      <p>Aquí se mostrarán los reportes.</p>
    </div>
  );
} 