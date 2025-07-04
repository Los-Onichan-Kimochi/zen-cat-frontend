import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useUserMemberships } from '@/hooks/use-user-memberships';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { membershipService } from '@/api/membership/membership';
import { Membership } from '@/types/membership';

export const Route = createFileRoute('/perfil')({
  component: PerfilComponent,
});

function PerfilComponent() {
  const { user } = useAuth();
  const {
    memberships,
    isLoading: membershipsLoading,
    error: membershipsError,
  } = useUserMemberships();

  // Mostrar solo activas por defecto
  const [showHistory, setShowHistory] = useState(false);

  // Estado local para reflejar cambios inmediatos y manejar carga por membresía
  const [membershipList, setMembershipList] = useState<Membership[]>([]);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMembershipList(memberships);
  }, [memberships]);

  const toggleSuspend = async (m: Membership) => {
    const newStatus = m.status === 'ACTIVE' ? 'ON_HOLD' : 'ACTIVE';
    setUpdatingIds((prev) => new Set(prev).add(m.id));
    try {
      await membershipService.updateMembership(m.id, { status: newStatus as any });
      // Actualizar localmente
      setMembershipList((prev) =>
        prev.map((item) => (item.id === m.id ? { ...item, status: newStatus as any } : item)),
      );
    } catch (err) {
      console.error('Error actualizando membresía', err);
    } finally {
      setUpdatingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(m.id);
        return newSet;
      });
    }
  };

  const toggleHistory = () => setShowHistory((prev) => !prev);

  const statusPriority: Record<string, number> = {
    ACTIVE: 1,
    ON_HOLD: 2,
    SUSPENDED: 2,
    INACTIVE: 3,
    EXPIRED: 3,
    CANCELLED: 4,
  };

  const visibleMemberships = showHistory
    ? [...membershipList].sort((a, b) => {
        const pa = statusPriority[a.status as string] ?? 5;
        const pb = statusPriority[b.status as string] ?? 5;
        if (pa !== pb) return pa - pb;
        // si misma prioridad ordenar por fecha inicio descendente
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      })
    : membershipList.filter((m) => m.status === 'ACTIVE');

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
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user?.name || 'No especificado'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user?.email || 'No especificado'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Rol
                    </label>
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

              {/* Memberships Info */}
              <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Mis Membresías
                </h2>

                {/* Controles */}
                {!membershipsLoading && memberships.length > 0 && (
                  <div className="mb-4 flex justify-end">
                    <button
                      onClick={toggleHistory}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {showHistory ? 'Ver solo activas' : 'Ver historial'}
                    </button>
                  </div>
                )}

                {/* Loading State */}
                {membershipsLoading && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    <span className="ml-2 text-sm text-gray-600">
                      Cargando membresías...
                    </span>
                  </div>
                )}

                {/* Error State */}
                {!membershipsLoading && membershipsError && (
                  <p className="text-red-600 text-sm py-4 text-center">
                    Error al cargar las membresías: {membershipsError}
                  </p>
                )}

                {/* Empty State */}
                {!membershipsLoading && !membershipsError && memberships.length === 0 && (
                  <p className="text-sm text-gray-600 py-4 text-center">
                    No tienes membresías activas.
                  </p>
                )}

                {/* Memberships List */}
                {!membershipsLoading && !membershipsError && visibleMemberships.length > 0 && (
                  <div className="space-y-4">
                    {visibleMemberships.map((membership) => {
                      const planTypeMap: Record<'MONTHLY' | 'ANNUAL', string> = {
                        MONTHLY: 'Plan mensual',
                        ANNUAL: 'Plan anual',
                      };

                      const statusMap: Record<string, string> = {
                        ACTIVE: 'Activa',
                        ON_HOLD: 'Suspendida',
                        SUSPENDED: 'Suspendida',
                        INACTIVE: 'Inactiva',
                        EXPIRED: 'Expirada',
                        CANCELLED: 'Cancelada',
                      };

                      const statusText =
                        statusMap[membership.status] ||
                        membership.status.charAt(0) + membership.status.slice(1).toLowerCase();

                      const formatDate = (dateStr: string) =>
                        format(new Date(dateStr), "dd 'de' MMMM 'del' yyyy", { locale: es });

                      const planLabel =
                        (membership.plan.type && planTypeMap[membership.plan.type as 'MONTHLY' | 'ANNUAL']) ||
                        (membership.plan as any).name ||
                        'Plan';

                      const isInactiveCard = !['ACTIVE', 'ON_HOLD', 'SUSPENDED'].includes(
                        membership.status as string,
                      );

                      return (
                        <div
                          key={membership.id}
                          className={`${
                            isInactiveCard
                              ? 'bg-gray-100 text-gray-700 border-gray-200'
                              : 'bg-gray-50'
                          } p-4 rounded-lg border`}
                        >
                          <p
                            className={`text-lg font-semibold ${isInactiveCard ? 'text-gray-700' : 'text-gray-900'}`}
                          >
                            {membership.community.name}
                          </p>
                          <p className={`text-sm ${isInactiveCard ? 'text-gray-700' : 'text-gray-600'}`}>
                            {planLabel}{' '}
                            • S/.{membership.plan.fee ?? '--'} •{' '}
                            {membership.plan.reservation_limit ?? '∞'} reservas
                          </p>
                          <p className={`text-sm mt-1 ${isInactiveCard ? 'text-gray-700' : 'text-gray-600'}`}>
                            Estado: {statusText}
                          </p>
                          <p className={`text-sm mt-1 ${isInactiveCard ? 'text-gray-700' : 'text-gray-600'}`}>
                            Vigencia: {formatDate(membership.start_date)} -{' '}
                            {formatDate(membership.end_date)}
                          </p>

                          {/* Toggle suspensión */}
                          {membership.status === 'ACTIVE' || (membership.status as any) === 'ON_HOLD' ? (
                            <button
                              onClick={() => toggleSuspend(membership)}
                              disabled={updatingIds.has(membership.id)}
                              className={`mt-3 px-3 py-1 text-sm rounded-lg border transition-all ${
                                membership.status === 'ACTIVE'
                                  ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-600'
                                  : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-600'
                              } ${updatingIds.has(membership.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {updatingIds.has(membership.id)
                                ? 'Procesando...'
                                : membership.status === 'ACTIVE'
                                ? 'Suspender'
                                : 'Reactivar'}
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
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
                    <span className="text-sm text-gray-600">
                      Reservas totales
                    </span>
                    <span className="text-sm font-semibold">0</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Comunidades activas
                    </span>
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
