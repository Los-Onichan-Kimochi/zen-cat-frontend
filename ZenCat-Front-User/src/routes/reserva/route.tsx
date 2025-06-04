import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/reserva')({
  component: ReservaPage,
});

function ReservaPage() {
  return (
    <div className="p-2">
      <h2 className="text-2xl font-bold">Reserva</h2>
      <p>Contenido de la página Reserva</p>
    </div>
  );
}
