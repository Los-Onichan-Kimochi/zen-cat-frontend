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
import { Reservation, ReservationState } from '@/types/reservation'; // Importa el enum actualizado
import { reservationsApi } from '@/api/reservations/reservations';
import { professionalsApi } from '@/api/professionals/professionals';
import { localsApi } from '@/api/locals/locals';
import { useAuth } from '@/context/AuthContext';
import { communityServicesApi } from '@/api/communities/community-services';
import { servicesApi } from '@/api/services/services';

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
  const [filterByPlace, setFilterByPlace] = useState('');
  
  // Estados para el dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

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
        const response = await reservationsApi.getReservationsByCommunityAndUser(communityId as string, userId);
        const communityServices = await communityServicesApi.getCommunityServices([communityId as string]);
        // Enriquecer las reservas con información de profesor y lugar
        const reservationsWithDetails = await Promise.all(
          response.map(async (reservation: Reservation) => {
            const session = reservation.session;
            
            let professionalName = "";
            let placeName = "";
            
            const communityService = communityServices.find((service) => service.id === reservation.session.community_service_id);
            const service = await servicesApi.getServiceById(communityService?.service_id as string);
            
            // Obtener información del profesor si es necesario
            if (session && session.professional_id && !reservation.professional) {
              try {
                const professionalData = await professionalsApi.getProfessional(session.professional_id);
                professionalName = professionalData.name;
              } catch (error) {
                console.warn(`No se pudo obtener información del profesor: ${error}`);
                professionalName = session.title || `Profesor ID: ${session.professional_id}`;
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
                console.warn(`No se pudo obtener información del local: ${error}`);
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
              service_name: service?.name || 'Servicio desconocido'
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
        (res) =>
          res.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          (res.user_name?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
          (res.professional?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
          (res.place?.toLowerCase() || '').includes(lowerCaseSearchTerm),
      );
    }

    if (filterByDate) {
      const today = new Date();
      currentReservations = currentReservations.filter((res) => {
        const reservationDate = new Date(res.reservation_time);
        if (filterByDate === 'today') {
          return reservationDate.toDateString() === today.toDateString();
        } else if (filterByDate === 'week') {
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 7);
          return reservationDate >= sevenDaysAgo && reservationDate <= today;
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

    if (filterByPlace) {
      currentReservations = currentReservations.filter((res) =>
        res.place?.toLowerCase().includes(filterByPlace.toLowerCase()),
      );
    }

    return currentReservations;
  }, [
    allReservations,
    searchTerm,
    filterByDate,
    filterByStatus,
    filterByPlace,
  ]);

  const handleViewReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedReservation(null);
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      // TODO: Implementar la llamada al endpoint para cancelar la reserva
      console.log('Cancelando reserva:', reservationId);
      // await reservationsApi.cancelReservation(reservationId);
      
      // Actualizar la lista de reservas
      // fetchReservations();
      
      alert('Funcionalidad de cancelar reserva pendiente de implementar');
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      alert('Error al cancelar la reserva');
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
                 filterByDate === 'week' ? 'Última semana' : 'Filtrar por fecha'}
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
              {/* Aquí puedes añadir más opciones de fecha o un DatePicker */}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtro por estado */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full sm:w-auto text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white flex items-center gap-2">
                {filterByStatus === '' ? 'Filtrar por estado' : 
                 filterByStatus === 'DONE' ? 'Finalizada' : 
                 filterByStatus === 'CANCELLED' ? 'Cancelada' : 
                 filterByStatus === 'CONFIRMED' ? 'Confirmada' : 
                 filterByStatus === 'ANULLED' ? 'Anulada' : 'Filtrar por estado'}
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

          {/* Filtro por lugar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full sm:w-auto text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white flex items-center gap-2">
                {filterByPlace === '' ? 'Filtrar por lugar' : filterByPlace}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterByPlace('')}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByPlace('pabellón a')}>
                Pabellón A
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilterByPlace('gimnasio principal')}
              >
                Gimnasio Principal
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByPlace('pabellón b')}>
                Pabellón B
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilterByPlace('salón de usos múltiples')}
              >
                Salón de Usos Múltiples
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilterByPlace('área recreativa')}
              >
                Área Recreativa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilterByPlace('edificio central')}
              >
                Edificio Central
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilterByPlace('zona deportiva')}
              >
                Zona Deportiva
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
