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
import { Reservation, ReservationState } from '@/types/reservation'; // Importa el enum actualizado
import { reservationsApi } from '@/api/reservations/reservations';
import { professionalsApi } from '@/api/professionals/professionals';
import { localsApi } from '@/api/locals/locals';
import { useAuth } from '@/context/AuthContext';

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
        
        // Enriquecer las reservas con información de profesor y lugar
        const reservationsWithDetails = await Promise.all(
          response.map(async (reservation: Reservation) => {
            const session = reservation.session;
            
            let teacherName = "";
            let placeName = "";
            
            const communityService = await communityServicesApi.getCommunityService(reservation.community_service_id);

            // Obtener información del profesor si es necesario
            if (session && session.professional_id && !reservation.teacher) {
              try {
                const professionalData = await professionalsApi.getProfessional(session.professional_id);
                teacherName = professionalData.name;
              } catch (error) {
                console.warn(`No se pudo obtener información del profesor: ${error}`);
                teacherName = session.title || `Profesor ID: ${session.professional_id}`;
              }
            } else if (reservation.teacher) {
              // Si ya tenemos el nombre del profesor en la reserva, usarlo directamente
              teacherName = reservation.teacher;
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
              teacher: teacherName || reservation.teacher,
              place: placeName || reservation.place
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
          (res.teacher?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
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
          filterByStatus === 'completada' &&
          stateEnumValue === ReservationState.DONE
        ) {
          return true;
        }
        if (
          filterByStatus === 'cancelada' &&
          stateEnumValue === ReservationState.CANCELLED
        ) {
          return true;
        }
        if (
          filterByStatus === 'confirmada' &&
          stateEnumValue === ReservationState.CONFIRMED
        ) {
          return true;
        }
        if (
          filterByStatus === 'anulada' &&
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
    alert(
      `Ver detalles de la reserva: ${reservation.name} (ID: ${reservation.id})`,
    );
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
                Filtrar por fecha
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
                Filtrar por estado
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterByStatus('')}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByStatus('en proceso')}>
                En proceso
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByStatus('completada')}>
                Completada
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByStatus('cancelada')}>
                Cancelada
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtro por lugar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full sm:w-auto text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white flex items-center gap-2">
                Filtrar por lugar
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
    </div>
  );
};

export default CommunityReservasLayout;
