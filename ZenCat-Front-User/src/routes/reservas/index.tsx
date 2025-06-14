import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export const Route = createFileRoute('/reservas/')({
  component: ReservasComponent,
});

function ReservasComponent() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Mis Reservas
          </h1>

          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                ¡Bienvenido a tu panel de reservas!
              </h2>
              <p className="text-gray-600 mb-6">
                Desde aquí podrás gestionar todas tus reservas de actividades.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Reservas Activas
                  </h3>
                  <p className="text-2xl font-bold text-blue-600">0</p>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">
                    Completadas
                  </h3>
                  <p className="text-2xl font-bold text-green-600">0</p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Total</h3>
                  <p className="text-2xl font-bold text-gray-600">0</p>
                </div>
              </div>

              <div className="mt-8">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                  Hacer Nueva Reserva
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
