import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/reserva/')({
  component: ReservaIndexComponent,
});

function ReservaIndexComponent() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir automáticamente al primer paso
    navigate({
      to: '/reserva/servicios',
      replace: true,
    });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando flujo de reserva...</p>
      </div>
    </div>
  );
}
