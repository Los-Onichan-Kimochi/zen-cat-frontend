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
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
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

  // Actualizar el contexto de reservación si se pasan parámetros desde la navegación
  useEffect(() => {
    if (search.communityId && search.communityId !== reservationData.communityId) {
      updateReservation({ communityId: search.communityId });
    }

    // Si se pasa un serviceId, buscar y cargar el servicio
    if (search.serviceId && (!reservationData.service || reservationData.service.id !== search.serviceId)) {
      servicesApi.getServiceById(search.serviceId).then(service => {
        updateReservation({
          service: {
            id: service.id,
            name: service.name,
            description: service.description,
            image_url: service.image_url,
          }
        });
      }).catch(error => {
        console.error('Error loading service:', error);
      });
    }
  }, [search.communityId, search.serviceId, reservationData.communityId, reservationData.service, updateReservation]);

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

  // Debug logging
  console.log('Selected service:', reservationData.service);
  console.log('Service-locals data:', serviceLocals);
  console.log('Available local IDs:', availableLocalIds);

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
  const locations: ReservationLocation[] = localsData
    .filter((local) => {
      // If no service is selected, show all locations
      if (!reservationData.service?.id) return true;
      // If service is selected, only show locations that have that service available
      const isIncluded = availableLocalIds.includes(local.id);
      console.log(
        `Local ${local.local_name} (${local.id}): ${isIncluded ? 'INCLUDED' : 'EXCLUDED'}`,
      );
      return isIncluded;
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

  console.log(`Final filtered locations count: ${locations.length}`);

  // Get unique districts for filter
  const uniqueDistricts = Array.from(
    new Set(locations.map((location) => location.district)),
  );

  // Filter and sort locations
  let filteredLocations = locations.filter((location) => {
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
    filteredLocations.sort((a, b) => a.district.localeCompare(b.district));
  } else if (sortBy === 'address') {
    filteredLocations.sort((a, b) => a.address.localeCompare(b.address));
  }

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
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-6">
            {/* Título */}
            <h3 className="text-xl font-semibold text-center">
              Selecciona el lugar de tu preferencia
            </h3>

            {/* Mensaje informativo si hay servicio seleccionado */}
            {reservationData.service && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-center">
                <p className="text-blue-800 text-sm">
                  Mostrando ubicaciones disponibles para:{' '}
                  <span className="font-semibold">
                    {reservationData.service.name}
                  </span>
                </p>
              </div>
            )}

            {/* Barra de búsqueda y filtros */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <input
                type="text"
                placeholder="Buscar lugar específico ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-1/2 border border-gray-300 rounded-md px-4 py-2"
              />
              <div className="flex gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-4 py-2"
                >
                  <option value="">Ordenar por</option>
                  <option value="district">Distrito</option>
                  <option value="address">Dirección</option>
                </select>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-4 py-2"
                >
                  <option value="">Filtrar por distrito</option>
                  {uniqueDistricts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              Resultados: {filteredLocations.length} lugares
            </div>

            {/* Tabla de ubicaciones */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border p-3 text-left font-medium">
                      Selección
                    </th>
                    <th className="border p-3 text-left font-medium">
                      Dirección
                    </th>
                    <th className="border p-3 text-left font-medium">Lugar</th>
                    <th className="border p-3 text-left font-medium">
                      Distrito
                    </th>
                    <th className="border p-3 text-left font-medium">
                      Capacidad
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLocations.map((location) => (
                    <tr
                      key={location.id}
                      className={`hover:bg-gray-50 cursor-pointer ${selectedLocationId === location.id ? 'bg-blue-50' : ''
                        }`}
                      onClick={() => handleLocationSelect(location)}
                    >
                      <td className="border p-3 text-center">
                        <input
                          type="radio"
                          name="location"
                          checked={selectedLocationId === location.id}
                          onChange={() => handleLocationSelect(location)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="border p-3">{location.address}</td>
                      <td className="border p-3">{location.pavilion}</td>
                      <td className="border p-3">{location.district}</td>
                      <td className="border p-3">
                        {location.capacity || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredLocations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron ubicaciones que coincidan con tu búsqueda.
                </div>
              )}
            </div>

            {/* Paginación */}
            <div className="flex justify-center items-center gap-4">
              <button className="px-3 py-1 border rounded hover:bg-gray-50">
                Anterior
              </button>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-black text-white rounded">
                  1
                </button>
                <button className="px-3 py-1 border rounded hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-1 border rounded hover:bg-gray-50">
                  3
                </button>
              </div>
              <button className="px-3 py-1 border rounded hover:bg-gray-50">
                Siguiente
              </button>
            </div>
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
        <Button onClick={handleContinue} disabled={!selectedLocationId}>
          Seleccionar
        </Button>
      </div>
    </div>
  );
}
