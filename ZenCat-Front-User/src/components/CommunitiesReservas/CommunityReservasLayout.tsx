import { useState, useEffect, useMemo } from 'react';
import { useLocation, useParams, useNavigate } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Calendar } from 'lucide-react';
import { ReservationsTable } from './CommunityReservationTable';
import { ReservationDetailDialog } from './ReservationDetailDialog';
import { Reservation, ReservationState } from '@/types/reservation';
import { reservationsApi } from '@/api/reservations/reservations';
import { professionalsApi } from '@/api/professionals/professionals';
import { localsApi } from '@/api/locals/locals';
import { useAuth } from '@/context/AuthContext';
import { communityServicesApi } from '@/api/communities/community-services';
import { servicesApi } from '@/api/services/services';
import { membershipsApi } from '@/api/memberships/memberships';

const CommunityReservasLayout = () => {
  const { communityId } = useParams({
    from: '/historial-reservas/$communityId',
  });

  const { search } = useLocation();
  const { user } = useAuth();
  const queryParams = new URLSearchParams(search);
  let communityName = queryParams.get('name');

  if (communityName) {
    communityName = decodeURIComponent(communityName);
  }

  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate({ to: `/mis-comunidades` });
  };

  // Función para traducir estados de reserva al español
  const translateReservationState = (state: ReservationState): string => {
    switch (state) {
      case ReservationState.CONFIRMED:
        return 'confirmada';
      case ReservationState.DONE:
        return 'finalizada';
      case ReservationState.CANCELLED:
        return 'cancelada';
      case ReservationState.ANULLED:
        return 'anulada';
      default:
        return String(state).toLowerCase();
    }
  };

  // --- Lógica para las Reservaciones ---
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [errorReservations, setErrorReservations] = useState<string | null>(
    null,
  );

  // Estados para los filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByDate, setFilterByDate] = useState('');
  const [filterByStatus, setFilterByStatus] = useState('');
  const [filterByType, setFilterByType] = useState('');

  // Estados para el dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  useEffect(() => {
    if (!communityId) {
      setErrorReservations('Community ID no disponible.');
      setLoadingReservations(false);
      return;
    }

    const fetchReservations = async () => {
      setLoadingReservations(true);
      setErrorReservations(null);
      try {
        const userId = user?.id;

        if (!userId) {
          throw new Error('No se pudo obtener el ID del usuario');
        }

        // Llamada al nuevo endpoint para obtener reservas de una comunidad específica y un usuario
        const response =
          await reservationsApi.getReservationsByCommunityAndUser(
            communityId as string,
            userId,
          );
        console.log("Response", response);
        console.log("CommunityId", communityId);
        console.log("UserId", userId);
        
        // Obtener los community services y los services de la comunidad
        const communityServices = await communityServicesApi.getCommunityServices([communityId as string]);
        const services = await communityServicesApi.getServicesByCommunityId(communityId as string);
        console.log("Community Services", communityServices);
        console.log("Services", services);
        
        // Enriquecer las reservas con información de profesor y lugar
        const reservationsWithDetails = await Promise.all(
          response.map(async (reservation: Reservation) => {
            const session = reservation.session;

            let professionalName = "";
            let placeName = "";
            
            // Buscar el community service y luego el service correspondiente
            const communityService = communityServices.find((cs) => cs.id === session.community_service_id);
            const service = services.find((s) => s.id === communityService?.service_id);
            
            // Obtener información del profesor si es necesario
            if (session && session.professional_id && !reservation.professional) {
              try {
                const professionalData = await professionalsApi.getProfessional(
                  session.professional_id,
                );
                professionalName = professionalData.name;
              } catch (error) {
                console.warn(
                  `No se pudo obtener información del profesor: ${error}`,
                );
                professionalName =
                  session.title || `Profesor ID: ${session.professional_id}`;
              }
            } else if (reservation.professional) {
              // Si ya tenemos el nombre del profesor en la reserva, usarlo directamente
              professionalName = reservation.professional;
            }

            // Obtener información del local si es necesario
            if (session && session.local_id && !reservation.place) {
              try {
                const localData = await localsApi.getLocal(session.local_id);
                placeName = localData.local_name;
              } catch (error) {
                console.warn(
                  `No se pudo obtener información del local: ${error}`,
                );
                placeName = `Local ID: ${session.local_id}`;
              }
            } else if (reservation.place) {
              placeName = reservation.place;
            }

            // Devolver la reserva con la información adicional
            return {
              ...reservation,
              professional: professionalName || reservation.professional,
              place: placeName || reservation.place,
              service_name: service?.name || 'Servicio desconocido',
              service_is_virtual: service?.is_virtual || false // Agregar la información de si es virtual
            };
          })
        );

        setAllReservations(reservationsWithDetails);
      } catch (err) {
        console.error('Error al cargar reservas:', err);
        setErrorReservations(
          'No se pudieron cargar las reservaciones. Inténtalo de nuevo más tarde.',
        );
      } finally {
        setLoadingReservations(false);
      }
    };

    fetchReservations();
  }, [communityId, user]);

  // Filtra las reservas basado en los estados de filtro
  const filteredReservations = useMemo(() => {
    let currentReservations = allReservations;

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentReservations = currentReservations.filter(
        (res) => {
          const isVirtual = res.service_is_virtual || false;
          const typeText = isVirtual ? 'virtual' : 'presencial';
          return (
            (res.service_name?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
            (res.session.title?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
            (res.professional?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
            typeText.includes(lowerCaseSearchTerm) ||
            translateReservationState(res.state).includes(lowerCaseSearchTerm)
          );
        }
      );
    }

    if (filterByDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalizar a inicio del día
      
      currentReservations = currentReservations.filter((res) => {
        const sessionDate = new Date(res.session.date);
        sessionDate.setHours(0, 0, 0, 0); // Normalizar a inicio del día
        
        if (filterByDate === 'today') {
          return sessionDate.getTime() === today.getTime();
        } else if (filterByDate === 'week') {
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 7);
          return sessionDate >= sevenDaysAgo && sessionDate <= today;
        } else if (filterByDate === 'month') {
          const thirtyDaysAgo = new Date(today);
          thirtyDaysAgo.setDate(today.getDate() - 30);
          return sessionDate >= thirtyDaysAgo && sessionDate <= today;
        } else if (filterByDate === 'future') {
          return sessionDate > today;
        } else if (filterByDate === 'past') {
          return sessionDate < today;
        }
        return true;
      });
    }

    // Ajuste en la lógica de filtrado para los nuevos estados
    if (filterByStatus) {
      // Usamos los valores exactos del enum para la comparación, no el label visual
      currentReservations = currentReservations.filter((res) => {
        // Obtenemos el valor "DONE", "CANCELLED", "EN_PROCESO" del enum
        const stateEnumValue = res.state;
        // Comparamos con el string que se configuró en setFilterByStatus
        if (
          filterByStatus === 'DONE' &&
          stateEnumValue === ReservationState.DONE
        ) {
          return true;
        }
        if (
          filterByStatus === 'CANCELLED' &&
          stateEnumValue === ReservationState.CANCELLED
        ) {
          return true;
        }
        if (
          filterByStatus === 'CONFIRMED' &&
          stateEnumValue === ReservationState.CONFIRMED
        ) {
          return true;
        }
        if (
          filterByStatus === 'ANULLED' &&
          stateEnumValue === ReservationState.ANULLED
        ) {
          return true;
        }
        return false; // Si no coincide con ninguno de los estados filtrados
      });
    }

    if (filterByType) {
      currentReservations = currentReservations.filter((res) => {
        const isVirtual = res.service_is_virtual || false;
        if (filterByType === 'virtual') {
          return isVirtual;
        } else if (filterByType === 'presencial') {
          return !isVirtual;
        }
        return true;
      });
    }

    return currentReservations;
  }, [
    allReservations,
    searchTerm,
    filterByDate,
    filterByStatus,
    filterByType,
  ]);

  const handleViewReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedReservation(null);
  };

  const handleCancelReservation = async (
    reservationOrId: Reservation | string,
  ) => {
    try {
      // Determinar si recibimos una reserva completa o solo el ID
      let reservation: Reservation;

      if (typeof reservationOrId === 'string') {
        // Si recibimos un ID, buscar la reserva en el estado local
        const foundReservation = allReservations.find(
          (r) => r.id === reservationOrId,
        );
        if (!foundReservation) {
          console.error('Reserva no encontrada');
          return;
        }
        reservation = foundReservation;
      } else {
        // Si recibimos el objeto completo
        reservation = reservationOrId;
      }

      if (!reservation) {
        console.error('Reserva no encontrada');
        return;
      }

      // 1. Cancelar la reserva
      await reservationsApi.updateReservation(reservation.id, {
        state: ReservationState.CANCELLED,
      });

      // 2. Si hay membresía asociada, actualizar las reservas usadas
      if (reservation.membership_id) {
        console.log('Actualizando membresía:', reservation.membership_id);

        const membership = await membershipsApi.getMembershipById(
          reservation.membership_id,
        );

        // Solo actualizar si el plan tiene límite de reservas y hay reservas usadas
        if (
          membership.plan.reservation_limit !== null &&
          typeof membership.reservations_used === 'number' &&
          membership.reservations_used > 0
        ) {
          await membershipsApi.updateMembership(membership.id, {
            reservations_used: membership.reservations_used - 1,
          });

          console.log('Reservas usadas actualizadas:', {
            membresiaId: membership.id,
            reservasAnteriores: membership.reservations_used,
            reservasNuevas: membership.reservations_used - 1,
          });
        }
      }

      // 3. Actualizar el estado local cambiando el estado de la reserva
      setAllReservations((prev) =>
        prev.map((r) =>
          r.id === reservation.id
            ? { ...r, state: ReservationState.CANCELLED }
            : r,
        ),
      );
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      alert('Error al cancelar la reserva. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado con el botón "Retroceder" */}
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={handleGoBack}
          className="text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white"
        >
          &lt; Retroceder
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Comunidad</h1>
        <div className="w-24"></div>
      </div>

      {/* Título y subtítulo de la comunidad */}
      <div className="text-center mb-8">
        <h2 className="text-5xl font-extrabold text-gray-900 leading-tight">
          {communityName || 'Comunidad Desconocida'}
        </h2>
        <p className="text-lg text-gray-600 mt-2">
          Aquí podrás encontrar todas las reservas de esta comunidad
        </p>
      </div>

      {/* Caja de Historial de reservas */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          Historial de reservas
        </h3>

        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            type="text"
            placeholder="Buscar reserva..."
            className="flex-grow rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Filtro por fecha */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full sm:w-auto text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {filterByDate === '' ? 'Filtrar por fecha' : 
                 filterByDate === 'today' ? 'Hoy' : 
                 filterByDate === 'week' ? 'Última semana' : 
                 filterByDate === 'month' ? 'Último mes' : 
                 filterByDate === 'future' ? 'Próximas' : 
                 filterByDate === 'past' ? 'Pasadas' : 'Filtrar por fecha'}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterByDate('')}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByDate('today')}>
                Hoy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByDate('week')}>
                Última semana
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByDate('month')}>
                Último mes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByDate('future')}>
                Próximas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByDate('past')}>
                Pasadas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtro por estado */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full sm:w-auto text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white flex items-center gap-2">
                {filterByStatus === ''
                  ? 'Filtrar por estado'
                  : filterByStatus === 'DONE'
                    ? 'Finalizada'
                    : filterByStatus === 'CANCELLED'
                      ? 'Cancelada'
                      : filterByStatus === 'CONFIRMED'
                        ? 'Confirmada'
                        : filterByStatus === 'ANULLED'
                          ? 'Anulada'
                          : 'Filtrar por estado'}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterByStatus('')}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByStatus('CONFIRMED')}>
                Confirmada
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByStatus('DONE')}>
                Finalizada
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByStatus('CANCELLED')}>
                Cancelada
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByStatus('ANULLED')}>
                Anulada
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtro por tipo */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full sm:w-auto text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white flex items-center gap-2">
                {filterByType === '' ? 'Filtrar por tipo' : 
                 filterByType === 'virtual' ? 'Virtual' : 
                 filterByType === 'presencial' ? 'Presencial' : 'Filtrar por tipo'}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterByType('')}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByType('virtual')}>
                Virtual
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByType('presencial')}>
                Presencial
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mensaje de resultados */}
        <p className="text-sm text-gray-500 mb-4">
          Resultados: {filteredReservations.length} reservas
        </p>

        {/* Muestra estado de carga o error */}
        {loadingReservations ? (
          <div className="text-center py-8">Cargando reservas...</div>
        ) : errorReservations ? (
          <div className="text-center py-8 text-red-600">
            {errorReservations}
          </div>
        ) : (
          <>
            {filteredReservations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay reservas para esta comunidad que coincidan con los
                filtros.
              </div>
            ) : (
              <ReservationsTable
                data={filteredReservations}
                onView={handleViewReservation}
              />
            )}
          </>
        )}
      </div>

      {/* Dialog de detalles de reserva */}
      <ReservationDetailDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        reservation={selectedReservation}
        onCancelReservation={handleCancelReservation}
        communityName={communityName || undefined}
      />
    </div>
  );
};

export default CommunityReservasLayout;
