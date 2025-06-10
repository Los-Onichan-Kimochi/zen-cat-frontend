import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export const Route = createFileRoute('/perfil')({
  component: PerfilComponent,
});

function PerfilComponent() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Mi Perfil</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Información Personal
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.name || 'No especificado'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.email || 'No especificado'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rol</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">
                      {user?.role || 'Usuario'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    Editar Perfil
                  </button>
                </div>
              </div>
              
              {/* Membership Info */}
              <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Mi Membresía
                </h2>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Plan Actual</p>
                  <p className="text-lg font-semibold text-gray-900">Plan Básico</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Acceso a una comunidad • Reservas limitadas
                  </p>
                </div>
                
                <div className="mt-4 flex gap-3">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                    Actualizar Plan
                  </button>
                  <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">
                    Ver Historial
                  </button>
                </div>
              </div>
            </div>
            
            {/* Profile Picture */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Foto de Perfil
                </h2>
                
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden mb-4">
                    {user?.imageUrl ? (
                      <img 
                        src={user.imageUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <span className="text-4xl">👤</span>
                      </div>
                    )}
                  </div>
                  
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    Cambiar Foto
                  </button>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Estadísticas
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reservas totales</span>
                    <span className="text-sm font-semibold">0</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Comunidades activas</span>
                    <span className="text-sm font-semibold">1</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Miembro desde</span>
                    <span className="text-sm font-semibold">Hoy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 