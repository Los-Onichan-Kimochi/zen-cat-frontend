import {
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { ReservaLugarRoute } from '@/layouts/reservation-layout';
import { z } from 'zod';
import {
  useReservation,
  ReservationLocation,
} from '@/context/reservation-context';
import { Button } from '@/components/ui/button';
import { Select, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { TablePagination } from '@/components/common/TablePagination';
import { ArrowLeft, Loader2, Search, MapPin, Users } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { localsApi } from '@/api/locals/locals';
import { serviceLocalsApi } from '@/api/service-locals/service-locals';
import { servicesApi } from '@/api/services/services';

export const Route = createFileRoute(ReservaLugarRoute)({
  component: LocationStepComponent,
  validateSearch: z.object({
    servicio: z.string().optional(),
    communityId: z.string().optional(),
    serviceId: z.string().optional(),
  }),
});

function LocationStepComponent() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/reserva/lugar' });
  const { reservationData, updateReservation } = useReservation();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(5);

  // Actualizar el contexto de reservación si se pasan parámetros desde la navegación
  useEffect(() => {
    if (
      search.communityId &&
      search.communityId !== reservationData.communityId
    ) {
      updateReservation({ communityId: search.communityId });
    }

    // Si se pasa un serviceId, buscar y cargar el servicio
    if (
      search.serviceId &&
      (!reservationData.service ||
        reservationData.service.id !== search.serviceId)
    ) {
      servicesApi
        .getServiceById(search.serviceId)
        .then((service) => {
          updateReservation({
            service: {
              id: service.id,
              name: service.name,
              description: service.description,
              image_url: service.image_url,
            },
          });
        })
        .catch((error) => {
          console.error('Error loading service:', error);
        });
    }
  }, [
    search.communityId,
    search.serviceId,
    reservationData.communityId,
    reservationData.service,
    updateReservation,
  ]);

  // Fetch service-local associations if a service is selected
  const {
    data: serviceLocals = [],
    isLoading: isLoadingServiceLocals,
    error: serviceLocalsError,
  } = useQuery({
    queryKey: ['service-locals', reservationData.service?.id],
    queryFn: () =>
      serviceLocalsApi.getLocalsForService(reservationData.service!.id),
    enabled: !!reservationData.service?.id,
  });

  // Extract local IDs from service-local associations
  const availableLocalIds = serviceLocals.map((sl) => sl.local_id);

  // Fetch locals from API
  const {
    data: localsData = [],
    isLoading: isLoadingLocals,
    error: localsError,
  } = useQuery({
    queryKey: ['locals'],
    queryFn: localsApi.getLocals,
  });

  const isLoading = isLoadingServiceLocals || isLoadingLocals;
  const error = serviceLocalsError || localsError;

  // Transform API data to match our interface and filter by service availability
  const allLocations: ReservationLocation[] = useMemo(() => {
    return localsData
      .filter((local) => {
        // If no service is selected, show all locations
        if (!reservationData.service?.id) return true;
        // If service is selected, only show locations that have that service available
        return availableLocalIds.includes(local.id);
      })
      .map((local) => ({
        id: local.id,
        name: local.local_name,
        address: `${local.street_name} ${local.building_number}`,
        district: local.district,
        pavilion: local.local_name,
        capacity: local.capacity,
        streetName: local.street_name,
        buildingNumber: local.building_number,
        province: local.province,
        region: local.region,
        reference: local.reference,
      }));
  }, [localsData, availableLocalIds, reservationData.service?.id]);

  // Get unique districts for filter
  const uniqueDistricts = Array.from(
    new Set(allLocations.map((location) => location.district)),
  );

  // Filter and sort locations
  const filteredAndSortedLocations = useMemo(() => {
    let filtered = allLocations.filter((location) => {
      const matchesSearch =
        location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.pavilion.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDistrict =
        !districtFilter || location.district === districtFilter;

      return matchesSearch && matchesDistrict;
    });

    // Apply sorting
    if (sortBy === 'district') {
      filtered.sort((a, b) => a.district.localeCompare(b.district));
    } else if (sortBy === 'address') {
      filtered.sort((a, b) => a.address.localeCompare(b.address));
    } else if (sortBy === 'capacity') {
      filtered.sort((a, b) => (b.capacity || 0) - (a.capacity || 0));
    }

    return filtered;
  }, [allLocations, searchTerm, districtFilter, sortBy]);

  // Paginación
  const totalPages = Math.ceil(filteredAndSortedLocations.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLocations = filteredAndSortedLocations.slice(startIndex, endIndex);

  // Reset página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, sortBy, districtFilter]);

  const handleLocationSelect = (location: ReservationLocation) => {
    setSelectedLocationId(location.id);
    updateReservation({ location });
  };

  const handleContinue = () => {
    if (selectedLocationId && reservationData.location) {
      navigate({
        to: '/reserva/horario',
        search: { servicio: search.servicio },
      });
    }
  };

  const handleBack = () => {
    navigate({
      to: '/reserva/servicios',
      search: { servicio: search.servicio },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 mx-auto mb-4" />
          <p className="text-gray-600">Cargando ubicaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">
          Error al cargar las ubicaciones: {error.message}
        </p>
        <Button onClick={() => window.location.reload()}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="border p-6 rounded-md min-h-[430px] w-full">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-6">
            {/* Título mejorado */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Selecciona el lugar de tu preferencia
              </h1>
              <p className="text-gray-600 text-lg">
                Encuentra la ubicación perfecta para tu actividad
              </p>
            </div>

            {/* Mensaje informativo si hay servicio seleccionado */}
            {reservationData.service && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-center max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <p className="text-blue-800 text-sm">
                    Mostrando ubicaciones disponibles para:{' '}
                    <span className="font-semibold">
                      {reservationData.service.name}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Barra de búsqueda y filtros mejorados */}
            <div className="flex flex-col lg:flex-row justify-center gap-4 max-w-5xl mx-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar lugar específico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-3">
                <Select
                  value={sortBy}
                  onValueChange={setSortBy}
                  placeholder="Ordenar por"
                >
                  <SelectItem value="">Sin ordenar</SelectItem>
                  <SelectItem value="district">Distrito</SelectItem>
                  <SelectItem value="address">Dirección</SelectItem>
                  <SelectItem value="capacity">Capacidad</SelectItem>
                </Select>
                <Select
                  value={districtFilter}
                  onValueChange={setDistrictFilter}
                  placeholder="Filtrar por distrito"
                >
                  <SelectItem value="">Todos los distritos</SelectItem>
                  {uniqueDistricts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Contador de resultados */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Resultados: {filteredAndSortedLocations.length} lugares
                {searchTerm && ` encontrados para "${searchTerm}"`}
                {districtFilter && ` en ${districtFilter}`}
              </p>
            </div>

            {/* Tabla mejorada */}
            {currentLocations.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-20">
                          Selección
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Dirección
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Lugar
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Distrito
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-24">
                          Capacidad
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentLocations.map((location) => (
                        <tr
                          key={location.id}
                          className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedLocationId === location.id 
                              ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                              : ''
                          }`}
                          onClick={() => handleLocationSelect(location)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <input
                                type="radio"
                                name="location"
                                checked={selectedLocationId === location.id}
                                onChange={() => handleLocationSelect(location)}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {location.address}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-900">
                              {location.pavilion}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {location.district}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {location.capacity || 'N/A'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-gray-400 mb-4">
                  <MapPin className="mx-auto h-16 w-16" />
                </div>
                <p className="text-gray-500 text-lg font-medium">
                  {searchTerm || districtFilter
                    ? 'No se encontraron ubicaciones que coincidan con tu búsqueda'
                    : 'No hay ubicaciones disponibles'
                  }
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Intenta ajustar tus filtros de búsqueda
                </p>
              </div>
            )}

            {/* Paginación reutilizable */}
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={!selectedLocationId}
          className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-300"
        >
          Seleccionar
        </Button>
      </div>
    </div>
  );
}
