import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/locales')({
  component: LocalesComponent,
});

function LocalesComponent() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Locales</h1>
      <p>Aquí se gestionarán los locales.</p>
    </div>
  );
} 