import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Community } from './CommunityCard';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SuspendMembershipDialog } from './SuspendMembershipDialog';
import { CancelMembershipDialog } from './CancelMembershipDialog';
import { useNavigate } from '@tanstack/react-router';
import { useToast } from '@/components/ui/Toast';
import { MembershipState, UpdateMembershipRequest } from '@/types/membership';
import { membershipsApi } from '@/api/memberships/memberships';

interface TabCommunityGeneralProps {
  community: Community | null;
  onViewReservations?: () => void;
  onRefresh?: () => void;
}

export function TabCommunityGeneral({
  community,
  onRefresh,
}: TabCommunityGeneralProps) {
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isProcessingReservation, setIsProcessingReservation] = useState(false);
  const [isProcessingMembership, setIsProcessingMembership] = useState(false);
  const navigate = useNavigate();
  const {
    error: showErrorToast,
    success: showSuccessToast,
    ToastContainer,
  } = useToast();

  if (!community) {
    return <div>No hay información disponible</div>;
  }
  console.log('Community:', community);

  const handleNewReservation = useCallback(() => {
    // Evitar múltiples clics rápidos
    if (isProcessingReservation) {
      return;
    }

    // Calcular reservas disponibles
    const reservasDisponibles =
      community.reservationsUsed === null
        ? null // Sin límite
        : (community.reservationLimit || 0) - (community.reservationsUsed || 0);

    // Verificar si hay reservas disponibles
    if (reservasDisponibles !== null && reservasDisponibles <= 0) {
      showErrorToast('No tienes reservas disponibles');
      return;
    }

    // Bloquear temporalmente para evitar múltiples navegaciones
    setIsProcessingReservation(true);

    // Navegar a la página de servicios pasando el communityId como search param
    navigate({
      to: '/reserva/servicios',
      search: {
        communityId: community.id,
      },
    });

    // Resetear el estado después de navegar
    setTimeout(() => setIsProcessingReservation(false), 500);
  }, [isProcessingReservation, community, navigate, showErrorToast]);

  const handleViewReservations = () => {
    // Navegar a la página de reservas pasando el communityId como search param
    navigate({
      to: '/historial-reservas/$communityId',
      params: {
        communityId: community.id,
      },
      search: { name: community.name },
    });
  };

  const handleViewMemberships = () => {
    // Navegar a la página de membresías pasando el communityId como search param
    navigate({
      to: '/historial-membresias/$communityId',
      params: {
        communityId: community.id,
      },
      search: { name: community.name },
    });
  };

  const handleSuspendMembership = async () => {
    if (!community.membershipId || isProcessingMembership) {
      return;
    }

    try {
      setIsProcessingMembership(true);
      await membershipsApi.updateMembership(community.membershipId, {
        status: MembershipState.SUSPENDED,
      });

      showSuccessToast('Membresía suspendida exitosamente');
      setShowSuspendDialog(false);

      // Refrescar los datos después de suspender
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error suspendiendo membresía:', error);
      showErrorToast('Error al suspender la membresía');
    } finally {
      setIsProcessingMembership(false);
    }
  };

  const handleCancelMembership = async () => {
    if (!community.membershipId || isProcessingMembership) {
      return;
    }

    try {
      setIsProcessingMembership(true);
      await membershipsApi.updateMembership(community.membershipId, {
        status: MembershipState.CANCELLED,
      });

      showSuccessToast('Membresía cancelada exitosamente');
      setShowCancelDialog(false);

      // Refrescar los datos después de cancelar
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error cancelando membresía:', error);
      showErrorToast('Error al cancelar la membresía');
    } finally {
      setIsProcessingMembership(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm py-6">
        <div className="flex justify-between px-6">
          <div className="text-left">
            <h1 className="text-4xl font-black">{community.name}</h1>
          </div>
          <div className="text-right text-xl font-bold">
            <p>
              {community.status === 'active'
                ? 'Membresía activa'
                : community.status === 'suspended'
                  ? 'Membresía suspendida'
                  : community.status === 'expired'
                    ? 'Membresía vencida'
                    : 'Membresía cancelada'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 mt-4 px-2">
          {/* Bloque de imagen */}
          <div className="flex justify-center items-center px-4">
            <img
              src={community.image || 'default-image-url'}
              alt="Imagen de la comunidad"
              className="rounded-md shadow-md w-full h-full object-cover"
            />
          </div>
          {/* Bloque de botones */}
          <div className="space-y-2 px-4 border-r border-l border-gray-500">
            <h2 className="font-bold text-2xl">Acciones</h2>
            <Button
              className="w-full text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleNewReservation}
              disabled={isProcessingReservation}
            >
              {isProcessingReservation ? 'Procesando...' : 'Nueva reserva'}
            </Button>
            <Button
              className="w-full text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white"
              onClick={handleViewReservations}
            >
              Ver reservas
            </Button>
            <Button
              className="w-full text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white"
              onClick={handleViewMemberships}
            >
              Ver membresías
            </Button>
            <Button
              className="w-full text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setShowSuspendDialog(true)}
              disabled={community.status !== 'active' || isProcessingMembership}
            >
              {isProcessingMembership ? 'Procesando...' : 'Suspender membresía'}
            </Button>
            <Button
              className="w-full text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setShowCancelDialog(true)}
              disabled={isProcessingMembership}
            >
              {isProcessingMembership ? 'Procesando...' : 'Cancelar membresía'}
            </Button>
          </div>
          {/* Bloque de información de membresía */}
          <div className="px-4 space-y-4">
            <h2 className="font-bold text-2xl mb-4">Membresía</h2>
            <div className="space-y-5">
              <div className="flex justify-between">
                <p className="text-gray-600">Tipo de plan:</p>
                <p>
                  {community.planType === 'MONTHLY'
                    ? 'Plan básico mensual'
                    : 'Plan anual'}
                </p>
              </div>

              <div className="flex justify-between">
                <p className="text-gray-600">Reservas disponibles:</p>
                <p className="font-medium">
                  {community.reservationsUsed === null
                    ? 'Sin límite'
                    : `${(community.reservationLimit || 0) - (community.reservationsUsed || 0)}`}
                </p>
              </div>

              <div className="flex justify-between">
                <p className="text-gray-600">Reservas usadas:</p>
                <p className="font-medium">
                  {community.reservationsUsed === null
                    ? 'Sin límite'
                    : community.reservationsUsed || 0}
                </p>
              </div>

              <div className="flex justify-between">
                <p className="text-gray-600">Fecha de inicio:</p>
                <p>
                  {community.startDate
                    ? format(
                        new Date(community.startDate),
                        "dd 'de' MMMM 'del' yyyy",
                        { locale: es },
                      )
                    : 'Sin fecha'}
                </p>
              </div>

              <div className="flex justify-between">
                <p className="text-gray-600">Fecha de fin:</p>
                <p>
                  {community.endDate
                    ? format(
                        new Date(community.endDate),
                        "dd 'de' MMMM 'del' yyyy",
                        { locale: es },
                      )
                    : 'Sin fecha'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diálogos de suspensión y cancelación */}
      <SuspendMembershipDialog
        isOpen={showSuspendDialog}
        onClose={() => setShowSuspendDialog(false)}
        onSuspend={handleSuspendMembership}
        communityName={community.name}
      />

      <CancelMembershipDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onCancel={handleCancelMembership}
        communityName={community.name}
      />

      {/* Toast Container */}
      <ToastContainer />
    </>
  );
}
