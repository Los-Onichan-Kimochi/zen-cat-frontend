'use client';

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { ArrowLeft, Plus } from 'lucide-react';
import { format } from 'date-fns';

import { reservationsApi } from '@/api/reservations/reservations';
import { sessionsApi } from '@/api/sessions/sessions';
import { userService } from '@/api/usuarios/usuarios';
import { communityServicesApi } from '@/api/communities/community-services';
import { membershipsApi } from '@/api/memberships/memberships';
import { Reservation } from '@/types/reservation';
import { User } from '@/types/user';

import { Button } from '@/components/ui/button';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { ReservationsTable } from '@/components/reservations/table';
import { CreateReservationModal } from '@/components/reservations/create-reservation-modal';
import { EditReservationModal } from '@/components/reservations/edit-reservation-modal';
import { ViewReservationModal } from '@/components/reservations/view-reservation-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useBulkDelete } from '@/hooks/use-bulk-delete';

export const Route = createFileRoute('/sesiones/reservas/$sessionId')({
  component: SessionReservationsComponent,
});

function SessionReservationsComponent() {
  const { sessionId } = Route.useParams();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  // Fetch session data
  const { data: sessionData, isLoading: isLoadingSession } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => sessionsApi.getSessionById(sessionId),
  });
  
  // Fetch community service data to get the community ID
  const { data: communityServiceData, isLoading: isLoadingCommunityService } = useQuery({
    queryKey: ['community-service', sessionData?.community_service_id],
    queryFn: () => communityServicesApi.getCommunityServiceById(sessionData?.community_service_id || ''),
    enabled: !!sessionData?.community_service_id,
  });
  
  // Extract the community ID
  const communityId = communityServiceData?.community_id;
  
  // Fetch users with memberships in the community
  const { data: membershipsResponse, isLoading: isLoadingMemberships } = useQuery<{
    users: User[];
  }>({
    queryKey: ['users-with-memberships', communityId],
    queryFn: () => membershipsApi.getUsersByCommunity(communityId || ''),
    enabled: !!communityId,
  });

  // Fetch all users as a fallback
  const { data: usersResponse, isLoading: isLoadingUsers } = useQuery<{
    users: User[];
  }>({
    queryKey: ['usuarios'],
    queryFn: () => userService.getAll(),
    enabled: !communityId || !membershipsResponse,
  });

  // Use users with memberships if available, otherwise fall back to all users
  const usersData = communityId && membershipsResponse?.users ? 
    membershipsResponse.users : 
    usersResponse?.users || [];

  // Fetch reservations for this session
  const {
    data: reservationsData,
    isLoading: isLoadingReservations,
    error: reservationsError,
  } = useQuery({
    queryKey: ['reservations', 'session', sessionId],
    queryFn: async () => {
      try {
        const response =
          await reservationsApi.getReservationsBySession(sessionId);
        return {
          reservations: Array.isArray(response)
            ? response
            : response?.reservations || [],
        };
      } catch (error) {
        console.error('Error fetching reservations:', error);
        return { reservations: [] };
      }
    },
  });

  // Delete mutation
  const { mutate: deleteReservation, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => reservationsApi.deleteReservation(id),
    onSuccess: (_, id) => {
      toast.success('Reserva Eliminada', {
        description: 'La reserva ha sido eliminada exitosamente.',
      });
      queryClient.invalidateQueries({
        queryKey: ['reservations', 'session', sessionId],
      });
      setIsDeleteModalOpen(false);
      setSelectedReservation(null);
    },
    onError: (err: any) => {
      toast.error('Error al Eliminar Reserva', {
        description: err.message || 'No se pudo eliminar la reserva.',
      });
    },
  });

  // Bulk delete hook
  const { handleBulkDelete, isBulkDeleting } = useBulkDelete<Reservation>({
    queryKey: ['reservations', 'session', sessionId],
    deleteFn: reservationsApi.bulkDeleteReservations,
    entityName: 'reserva',
    entityNamePlural: 'reservas',
    getId: (reservation) => reservation.id,
  });

  // Handlers
  const handleView = (reservation: Reservation) => {
    // Enriquecer la reserva seleccionada con datos de usuario
    const user = (usersData || []).find((u) => u.id === reservation.user_id);
    const enrichedReservation = {
      ...reservation,
      user_name: user ? user.name : 'Usuario desconocido',
    };
    setSelectedReservation(enrichedReservation);
    setIsViewModalOpen(true);
  };

  const handleEdit = (reservation: Reservation) => {
    // Verificar si la sesión está cancelada
    if (session?.state === 'CANCELLED') {
      toast.error('Acción no permitida', {
        description: 'No se pueden editar reservas de una sesión cancelada.'
      });
      return;
    }
    
    // Enriquecer la reserva seleccionada con datos de usuario
    const user = (usersData || []).find((u) => u.id === reservation.user_id);
    const enrichedReservation = {
      ...reservation,
      user_name: user ? user.name : 'Usuario desconocido',
    };
    setSelectedReservation(enrichedReservation);
    setIsEditModalOpen(true);
  };

  const handleDelete = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: ['reservations', 'session', sessionId],
    });
    setIsCreateModalOpen(false);
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: ['reservations', 'session', sessionId],
    });
    setIsEditModalOpen(false);
    setSelectedReservation(null);
  };

  if (isLoadingSession || isLoadingReservations || isLoadingUsers || isLoadingCommunityService || isLoadingMemberships) {
    return (
      <div className="p-6 h-full flex flex-col font-montserrat">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando...</div>
        </div>
      </div>
    );
  }

  if (reservationsError) {
    return (
      <div className="p-6 h-full flex flex-col font-montserrat">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">
            Error cargando reservas: {reservationsError.message}
          </div>
        </div>
      </div>
    );
  }

  const reservations = Array.isArray(reservationsData?.reservations)
    ? reservationsData.reservations
    : [];
  const session = sessionData;
  const users = usersData || [];

  // Enriquecer los datos de reserva con la información del usuario
  const enrichedReservations = reservations.map((reservation) => {
    const user = (usersData || []).find((u) => u.id === reservation.user_id);
    return {
      ...reservation,
      user_name: user ? user.name : 'Usuario desconocido',
    };
  });

  console.log('Reservations Data:', {
    raw: reservationsData,
    processed: reservations,
    enriched: enrichedReservations,
    error: reservationsError,
  });

  console.log('Users Data:', {
    count: users.length,
    withMembership: membershipsResponse ? membershipsResponse.users.length : 'N/A',
    communityId: communityId,
    users,
  });

  return (
    <div className="p-6 h-full flex flex-col font-montserrat">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/sesiones' })}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Sesiones
        </Button>
      </div>

      <HeaderDescriptor
        title={`RESERVAS - ${session?.title || 'Sesión'}`}
        subtitle={`RESERVAS DE LA SESIÓN ${session ? `(${new Date(session.date).toLocaleDateString('es-ES')})` : ''}`}
      />

      {/* Session info card */}
      {session && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Título</div>
              <div className="font-medium">{session.title}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Fecha y Hora</div>
              <div className="font-medium">
                {new Date(session.date).toLocaleDateString('es-ES')} -{' '}
                {format(new Date(session.start_time), 'HH:mm')} - {format(new Date(session.end_time), 'HH:mm')}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Ocupación</div>
              <div className="font-medium">
                {reservations.length}/{session.capacity} reservas
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Estado</div>
              <div className={`font-medium ${
                session.state === 'CANCELLED' ? 'text-red-600' : 
                session.state === 'COMPLETED' ? 'text-gray-600' : 
                session.state === 'ONGOING' ? 'text-green-600' : 
                'text-blue-600'
              }`}>
                {session.state === 'SCHEDULED' ? 'Programada' :
                 session.state === 'ONGOING' ? 'En curso' :
                 session.state === 'COMPLETED' ? 'Completada' :
                 session.state === 'CANCELLED' ? 'Cancelada' :
                 session.state === 'RESCHEDULED' ? 'Reprogramada' : 
                 session.state}
              </div>
            </div>
          </div>
          {session.state === 'CANCELLED' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <div className="text-red-600">
                <strong>Sesión cancelada:</strong> No se pueden agregar ni modificar reservas para esta sesión.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => {
            if (session?.state === 'CANCELLED') {
              toast.error('Acción no permitida', {
                description: 'No se pueden agregar reservas a una sesión cancelada.'
              });
              return;
            }
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2"
          disabled={session?.state === 'CANCELLED'}
          title={session?.state === 'CANCELLED' ? "No se pueden agregar reservas para sesiones canceladas" : ""}
        >
          <Plus className="h-4 w-4" />
          Nueva Reserva
        </Button>
      </div>

      {/* Table */}
      <ReservationsTable
        data={enrichedReservations}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        isBulkDeleting={isBulkDeleting}
        disableEditing={session?.state === 'CANCELLED'}
      />

      {/* Create Modal */}
      <CreateReservationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        sessionId={sessionId}
        users={users}
        sessionName={session?.title || ''}
        communityId={communityId || ''}
      />

      {/* Edit Modal */}
      <EditReservationModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedReservation(null);
        }}
        onSuccess={handleEditSuccess}
        reservation={selectedReservation}
      />

      {/* View Modal */}
      <ViewReservationModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedReservation(null);
        }}
        reservation={selectedReservation}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la reserva
              permanentemente.
              {selectedReservation && (
                <div className="mt-2 font-medium">
                  Reserva: {selectedReservation.name}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedReservation) {
                  deleteReservation(selectedReservation.id);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
