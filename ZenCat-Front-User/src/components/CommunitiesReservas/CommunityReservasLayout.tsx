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
import { ReservationsTable } from './CommunityReservationTable';
import { Reservation, ReservationState } from '@/types/reservation'; // Importa el enum actualizado
import {} from '@/api/reservations/reservations';
const CommunityReservasLayout = () => {
  const { communityId } = useParams({
    from: '/mis-comunidades/$communityId/reservas/historial',
  });

  const { search } = useLocation();
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
  const [errorReservations, setErrorReservations] = useState<string | null>(null);

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
        // --- SIMULACIÓN DE DATOS DUMMY ---
        const dummyData: Reservation[] = [
          {
            "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            "name": "Clase de Yoga Matutina",
            "user_name": "Juan Pérez",
            "teacher": "Ana García",
            "place": "Pabellón A",
            "reservation_time": "2025-06-20T09:00:00Z", // Hoy
            "state": "ONGOING" // En proceso
          },
          {
            "id": "b2c3d4e5-f6a7-8901-2345-67890abcdef0",
            "name": "Consulta Pediátrica",
            "user_name": "María López",
            "teacher": "Dr. Luis Martínez",
            "place": "Edificio Central",
            "reservation_time": "2025-06-19T14:30:00Z", // Ayer
            "state": "DONE" // Completada
          },
          {
            "id": "c3d4e5f6-a7b8-9012-3456-7890abcdef01",
            "name": "Acceso a Gimnasio",
            "user_name": "Carlos Sánchez",
            "teacher": null,
            "place": "Gimnasio Principal",
            "reservation_time": "2025-06-15T18:00:00Z", // Dentro de la última semana
            "state": "ONGOING" // En proceso
          },
          {
            "id": "d4e5f6a7-b8c9-0123-4567-890abcdef012",
            "name": "Clase de Pilates",
            "user_name": "Laura Torres",
            "teacher": "Elena Ruiz",
            "place": "Salón de Usos Múltiples",
            "reservation_time": "2025-06-10T10:00:00Z", // Más antigua que la última semana
            "state": "DONE" // Completada
          },
          {
            "id": "e5f6a7b8-c9d0-1234-5678-90abcdef0123",
            "name": "Sesión de Mindfulness",
            "user_name": "Pedro Gómez",
            "teacher": null,
            "place": "Área Recreativa",
            "reservation_time": "2025-06-05T16:00:00Z", // Más antigua
            "state": "CANCELLED" // Cancelada
          },
          {
            "id": "f6a7b8c9-d0e1-2345-6789-0abcdef01234",
            "name": "Entrenamiento Funcional",
            "user_name": "Ana Morales",
            "teacher": "Ricardo Castro",
            "place": "Zona Deportiva",
            "reservation_time": "2025-06-20T17:00:00Z", // Hoy
            "state": "ONGOING" // En proceso
          },
          {
            "id": "a0b1c2d3-e4f5-6789-0123-456789abcdef",
            "name": "Clase de Zumba",
            "user_name": "Sofía Díaz",
            "teacher": "Carolina Vega",
            "place": "Pabellón A",
            "reservation_time": "2025-06-17T19:00:00Z", // Dentro de la última semana
            "state": "DONE" // Completada
          }
        ];

        setAllReservations(dummyData);
        // --- FIN SIMULACIÓN DE DATOS DUMMY ---

        // Comenta o elimina la llamada real al backend durante el desarrollo con dummy data
        // const response = await fetch(`/api/communities/${communityId}/reservations`);
        // if (!response.ok) {
        //   throw new Error(`HTTP error! status: ${response.status}`);
        // }
        // const data: Reservation[] = await response.json();
        // setAllReservations(data);

      } catch (err) {
        console.error("Error al cargar reservas:", err);
        setErrorReservations('No se pudieron cargar las reservaciones. Inténtalo de nuevo más tarde.');
      } finally {
        setLoadingReservations(false);
      }
    };

    fetchReservations();
  }, [communityId]);

  // Filtra las reservas basado en los estados de filtro
  const filteredReservations = useMemo(() => {
    let currentReservations = allReservations;

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentReservations = currentReservations.filter(res =>
        res.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        res.user_name.toLowerCase().includes(lowerCaseSearchTerm) ||
        res.teacher?.toLowerCase().includes(lowerCaseSearchTerm) ||
        res.place?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (filterByDate) {
      const today = new Date();
      currentReservations = currentReservations.filter(res => {
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
      currentReservations = currentReservations.filter(res => {
        // Obtenemos el valor "DONE", "CANCELLED", "EN_PROCESO" del enum
        const stateEnumValue = res.state;
        // Comparamos con el string que se configuró en setFilterByStatus
        if (filterByStatus === 'completada' && stateEnumValue === ReservationState.DONE) {
            return true;
        }
        if (filterByStatus === 'cancelada' && stateEnumValue === ReservationState.CANCELLED) {
            return true;
        }
        if (filterByStatus === 'en proceso' && stateEnumValue === ReservationState.ONGOING) {
            return true;
        }
        return false; // Si no coincide con ninguno de los estados filtrados
      });
    }


    if (filterByPlace) {
        currentReservations = currentReservations.filter(res =>
            res.place?.toLowerCase().includes(filterByPlace.toLowerCase())
        );
    }

    return currentReservations;
  }, [allReservations, searchTerm, filterByDate, filterByStatus, filterByPlace]);


  const handleViewReservation = (reservation: Reservation) => {
    alert(`Ver detalles de la reserva: ${reservation.name} (ID: ${reservation.id})`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado con el botón "Retroceder" */}
      <div className="flex items-center justify-between mb-6">
        <Button onClick={handleGoBack} className="text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white">
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
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Historial de reservas</h3>

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
              <Button className="w-full sm:w-auto text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white">
                Filtrar por fecha
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterByDate('')}>Todos</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByDate('today')}>Hoy</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByDate('week')}>Última semana</DropdownMenuItem>
              {/* Aquí puedes añadir más opciones de fecha o un DatePicker */}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtro por estado */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full sm:w-auto text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white">
                Filtrar por estado
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterByStatus('')}>Todos</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByStatus('en proceso')}>En proceso</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByStatus('completada')}>Completada</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByStatus('cancelada')}>Cancelada</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtro por lugar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full sm:w-auto text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white">
                Filtrar por lugar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterByPlace('')}>Todos</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByPlace('pabellón a')}>Pabellón A</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByPlace('gimnasio principal')}>Gimnasio Principal</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByPlace('pabellón b')}>Pabellón B</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByPlace('salón de usos múltiples')}>Salón de Usos Múltiples</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByPlace('área recreativa')}>Área Recreativa</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByPlace('edificio central')}>Edificio Central</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByPlace('zona deportiva')}>Zona Deportiva</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mensaje de resultados */}
        <p className="text-sm text-gray-500 mb-4">Resultados: {filteredReservations.length} reservas</p>


        {/* Muestra estado de carga o error */}
        {loadingReservations ? (
          <div className="text-center py-8">Cargando reservas...</div>
        ) : errorReservations ? (
          <div className="text-center py-8 text-red-600">{errorReservations}</div>
        ) : (
          <>
            {filteredReservations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No hay reservas para esta comunidad que coincidan con los filtros.</div>
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