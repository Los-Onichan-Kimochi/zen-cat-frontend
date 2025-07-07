import { createFileRoute, Link } from '@tanstack/react-router';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useUserMemberships } from '@/hooks/use-user-memberships';
import { useUserOnboarding } from '@/hooks/use-user-onboarding';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { membershipsApi } from '@/api/memberships/memberships';
import { Membership, MembershipState } from '@/types/membership';

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
  const { onboardingData } = useUserOnboarding();

  // Mostrar solo activas por defecto
  const [showHistory, setShowHistory] = useState(false);

  // Estado local para reflejar cambios inmediatos y manejar carga por membresía
  const [membershipList, setMembershipList] = useState<Membership[]>([]);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMembershipList(memberships);
  }, [memberships]);

  const toggleSuspend = async (m: Membership) => {
    const newStatus =
      m.status === MembershipState.ACTIVE
        ? MembershipState.SUSPENDED
        : MembershipState.ACTIVE;
    setUpdatingIds((prev) => new Set(prev).add(m.id));
    try {
      await membershipsApi.updateMembership(m.id, { status: newStatus });
      // Actualizar localmente
      setMembershipList((prev) =>
        prev.map((item) =>
          item.id === m.id ? { ...item, status: newStatus } : item,
        ),
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

  const statusPriority: Record<MembershipState, number> = {
    [MembershipState.ACTIVE]: 1,
    [MembershipState.SUSPENDED]: 2,
    [MembershipState.EXPIRED]: 3,
    [MembershipState.CANCELLED]: 4,
  };

  const visibleMemberships = showHistory
    ? [...membershipList].sort((a, b) => {
        const pa = statusPriority[a.status] ?? 5;
        const pb = statusPriority[b.status] ?? 5;
        if (pa !== pb) return pa - pb;
        // si misma prioridad ordenar por fecha inicio descendente
        return (
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        );
      })
    : membershipList.filter((m) => m.status === MembershipState.ACTIVE);

  /* =====================================
   * Derived data for quick statistics
   * ===================================== */

  const roleDisplayMap: Record<string, string> = {
    CLIENT: 'Cliente',
    client: 'Cliente',
    ADMIN: 'Administrador',
    admin: 'Administrador',
    USER: 'Usuario',
    user: 'Usuario',
  };

  // Total reservations is the sum of the reservations_used of each membership (if available)
  const totalReservations = membershipList.reduce(
    (sum, m) => sum + (m.reservations_used ?? 0),
    0,
  );

  // Active communities are memberships in ACTIVE status
  const activeCommunitiesCount = membershipList.filter(
    (m) => m.status === MembershipState.ACTIVE,
  ).length;

  // "Miembro desde" is the earliest start_date of the memberships
  const earliestStartDate = membershipList.reduce<Date | null>(
    (earliest, m) => {
      const current = new Date(m.start_date);
      if (!earliest || current < earliest) return current;
      return earliest;
    },
    null,
  );

  const memberSinceLabel = earliestStartDate
    ? format(earliestStartDate, "dd 'de' MMMM 'del' yyyy", { locale: es })
    : 'N/A';

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Mi Perfil</h1>

          <div className="bg-white shadow-lg rounded-lg p-6 mb-6 flex flex-col md:flex-row gap-8 items-start">
            {/* Profile Picture (left part) */}
            <div className="flex-shrink-0 w-full md:w-auto text-center md:text-left">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Foto de Perfil
              </h2>
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden mb-4">
                  {user?.image_url || user?.imageUrl ? (
                    <img
                      src={user.image_url || user.imageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <span className="text-4xl">👤</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Info (right part) */}
            <div className="flex-grow w-full">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Información Personal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Nombre</p>
                  <p className="font-medium text-gray-800">{user?.name || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium text-gray-800">{user?.email || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Rol</p>
                  <p className="font-medium text-gray-800">{roleDisplayMap[user?.role as string] ?? 'Usuario'}</p>
                </div>
              </div>

              {/* Dirección del Onboarding si existe */}
              {onboardingData && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Dirección</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Región</p>
                      <p className="font-medium text-gray-800">{onboardingData.region}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Provincia</p>
                      <p className="font-medium text-gray-800">{onboardingData.province}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Distrito</p>
                      <p className="font-medium text-gray-800">{onboardingData.district}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Código Postal</p>
                      <p className="font-medium text-gray-800">{onboardingData.postal_code}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-gray-600">Dirección Completa</p>
                      <p className="font-medium text-gray-800 max-w-md truncate" title={onboardingData.address}>{onboardingData.address}</p>
                    </div>
                  </div>
                </div>
              )}
                           <div className="mt-6 text-right">
                 <Link
                   to="/profile"
                   className="inline-block bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition"
                 >
                   Editar Perfil
                 </Link>
               </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Estadísticas
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Reservas totales</span>
                <span className="text-lg font-semibold">
                  {totalReservations}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Comunidades activas
                </span>
                <span className="text-lg font-semibold">
                  {activeCommunitiesCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Miembro desde</span>
                <span className="text-sm font-semibold">
                  {memberSinceLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Memberships Info */}
          <div className="bg-white shadow-lg rounded-lg p-6">
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
            {!membershipsLoading &&
              !membershipsError &&
              memberships.length === 0 && (
                <p className="text-sm text-gray-600 py-4 text-center">
                  No tienes membresías activas.
                </p>
              )}

            {/* Memberships List */}
            {!membershipsLoading &&
              !membershipsError &&
              visibleMemberships.length > 0 && (
                <div className="space-y-4">
                  {visibleMemberships.map((membership) => {
                    const planTypeMap: Record<'MONTHLY' | 'ANNUAL', string> = {
                      MONTHLY: 'Plan mensual',
                      ANNUAL: 'Plan anual',
                    };

                    const statusMap: Record<MembershipState, string> = {
                      [MembershipState.ACTIVE]: 'Activa',
                      [MembershipState.SUSPENDED]: 'Suspendida',
                      [MembershipState.EXPIRED]: 'Expirada',
                      [MembershipState.CANCELLED]: 'Cancelada',
                    };

                    const statusText =
                      statusMap[membership.status] ||
                      membership.status.charAt(0).toUpperCase() +
                        membership.status.slice(1).toLowerCase();

                    const formatDate = (dateStr: string) =>
                      format(new Date(dateStr), "dd 'de' MMMM 'del' yyyy", {
                        locale: es,
                      });

                    const planLabel =
                      (membership.plan.type &&
                        planTypeMap[
                          membership.plan.type as 'MONTHLY' | 'ANNUAL'
                        ]) ||
                      (membership.plan as any).name ||
                      'Plan';

                    const isInactiveCard = ![
                      MembershipState.ACTIVE,
                      MembershipState.SUSPENDED,
                    ].includes(membership.status);

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
                          className={`text-lg font-semibold ${
                            isInactiveCard ? 'text-gray-700' : 'text-gray-900'
                          }`}
                        >
                          {membership.community.name}
                        </p>
                        <p
                          className={`text-sm ${
                            isInactiveCard ? 'text-gray-700' : 'text-gray-600'
                          }`}
                        >
                          {planLabel} • S/.{membership.plan.fee ?? '--'} •{' '}
                          {membership.plan.reservation_limit ?? '∞'} reservas
                        </p>
                        <p
                          className={`text-sm mt-1 ${
                            isInactiveCard ? 'text-gray-700' : 'text-gray-600'
                          }`}
                        >
                          Estado: {statusText}
                        </p>
                        <p
                          className={`text-sm mt-1 ${
                            isInactiveCard ? 'text-gray-700' : 'text-gray-600'
                          }`}
                        >
                          Vigencia: {formatDate(membership.start_date)} -{' '}
                          {formatDate(membership.end_date)}
                        </p>

                        {/* Toggle suspensión */}
                        {membership.status === MembershipState.ACTIVE ||
                        membership.status === MembershipState.SUSPENDED ? (
                          <button
                            onClick={() => toggleSuspend(membership)}
                            disabled={updatingIds.has(membership.id)}
                            className={`mt-3 px-3 py-1 text-sm rounded-lg border transition-all ${
                              membership.status === MembershipState.ACTIVE
                                ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-600'
                                : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-600'
                            } ${
                              updatingIds.has(membership.id)
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }`}
                          >
                            {updatingIds.has(membership.id)
                              ? 'Procesando...'
                              : membership.status === MembershipState.ACTIVE
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
      </div>
    </ProtectedRoute>
  );
}
