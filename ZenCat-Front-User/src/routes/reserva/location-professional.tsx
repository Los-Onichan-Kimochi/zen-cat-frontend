import {
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { ReservaLocationProfessionalRoute } from '@/layouts/reservation-layout';
import { z } from 'zod';
import {
  useReservation,
  ReservationLocation,
  ReservationProfessional,
} from '@/context/reservation-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { TablePagination } from '@/components/common/TablePagination';
import { ArrowLeft, Loader2, Search, MapPin, User, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { serviceLocalsApi } from '@/api/service-locals/service-locals';
import { servicesApi } from '@/api/services/services';
import { Professional } from '@/types/professional';
import { serviceProfessionalsApi } from '@/api/service-professionals/service-professionals';

export const Route = createFileRoute(ReservaLocationProfessionalRoute)({
  component: LocationProfessionalStepComponent,
  validateSearch: z.object({
    servicio: z.string().optional(),
    communityId: z.string().optional(),
    serviceId: z.string().optional(),
    membershipId: z.string().optional(),
  }),
});

function LocationProfessionalStepComponent() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/reserva/location-professional' });
  const { reservationData, updateReservation } = useReservation();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [districtFilter, setDistrictFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(5);

  // Actualizar el contexto de reservación si se pasan parámetros desde la navegación
  useEffect(() => {
    const updates: Partial<any> = {};
    
    if (search.communityId && search.communityId !== reservationData.communityId) {
      updates.communityId = search.communityId;
    }
    
    if (search.membershipId && search.membershipId !== reservationData.membershipId) {
      updates.membershipId = search.membershipId;
    }
    
    if (Object.keys(updates).length > 0) {
      updateReservation(updates);
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
              is_virtual: service.is_virtual,
            },
          });
        })
        .catch((error) => {
          console.error('Error loading service:', error);
        });
    }
  }, [
    search.communityId,
    search.membershipId,
    search.serviceId,
    reservationData.communityId,
    reservationData.membershipId,
    reservationData.service,
    updateReservation,
  ]);

  const isVirtualService = reservationData.service?.is_virtual || false;

  // Fetch locals from API (for presencial services)
  const {
    data: localsData = [],
    isLoading: isLoadingLocals,
    error: localsError,
  } = useQuery({
    queryKey: ['locals'],
    queryFn: () => serviceLocalsApi.getLocalsByServiceId(reservationData.service!.id),
    enabled: !!reservationData.service?.id && !isVirtualService,
  });

  // Fetch professionals from API (for virtual services)
  const {
    data: professionalsData = [],
    isLoading: isLoadingProfessionals,
    error: professionalsError,
  } = useQuery<Professional[]>({
    queryKey: ['professionals'],
    queryFn: () => serviceProfessionalsApi.getProfessionalsByServiceId(reservationData.service!.id),
    enabled: !!reservationData.service?.id && isVirtualService,
  });

  const isLoading = isVirtualService 
    ? (isLoadingProfessionals)
    : (isLoadingLocals);
  
  const error = isVirtualService 
    ? (professionalsError)
    : (localsError);

  // Transform API data for locations (presencial services)
  const allLocations: ReservationLocation[] = useMemo(() => {
    if (isVirtualService || !localsData) return [];
    
    return localsData.map((local: any) => ({
      id: local.id,
      name: local.local_name || local.name,
      address: `${local.street_name || local.address || ''} ${local.building_number || ''}`.trim(),
      district: local.district,
      pavilion: local.local_name || local.name,
      capacity: local.capacity,
      streetName: local.street_name,
      buildingNumber: local.building_number,
      province: local.province,
      region: local.region,
      reference: local.reference,
    }));
  }, [localsData, isVirtualService]);

  // Transform API data for professionals (virtual services)
  const allProfessionals: ReservationProfessional[] = useMemo(() => {
    if (!isVirtualService || !professionalsData) return [];
    
    return professionalsData.map((professional: any) => ({
      id: professional.id,
      name: professional.name,
      first_last_name: professional.first_last_name,
      second_last_name: professional.second_last_name ?? undefined,
      specialty: professional.specialty,
      email: professional.email,
      phone_number: professional.phone_number,
      type: professional.type,
      image_url: professional.image_url,
    }));
  }, [professionalsData, isVirtualService]);

  // Get unique values for filters
  const uniqueDistricts = Array.from(
    new Set(allLocations.map((location) => location.district)),
  );
  const uniqueSpecialties = Array.from(
    new Set(allProfessionals.map((professional) => professional.specialty)),
  );

  // Filter and sort data
  const filteredAndSortedItems = useMemo(() => {
    if (isVirtualService) {
      // Filter professionals
      let filtered = allProfessionals.filter((professional) => {
        const matchesSearch =
          professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          professional.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${professional.first_last_name} ${professional.second_last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSpecialty =
          !specialtyFilter || professional.specialty === specialtyFilter;

        return matchesSearch && matchesSpecialty;
      });

      // Apply sorting for professionals
      if (sortBy === 'name') {
        filtered.sort((a, b) => {
          const result = `${a.name} ${a.first_last_name}`.localeCompare(`${b.name} ${b.first_last_name}`);
          return sortOrder === 'asc' ? result : -result;
        });
      } else if (sortBy === 'specialty') {
        filtered.sort((a, b) => {
          const result = a.specialty.localeCompare(b.specialty);
          return sortOrder === 'asc' ? result : -result;
        });
      } else if (sortBy === 'contact') {
        filtered.sort((a, b) => {
          const result = a.email.localeCompare(b.email);
          return sortOrder === 'asc' ? result : -result;
        });
      }

      return filtered;
    } else {
      // Filter locations
      let filtered = allLocations.filter((location) => {
        const matchesSearch =
          location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          location.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
          location.pavilion.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDistrict =
          !districtFilter || location.district === districtFilter;

        return matchesSearch && matchesDistrict;
      });

      // Apply sorting for locations
      if (sortBy === 'address') {
        filtered.sort((a, b) => {
          const result = a.address.localeCompare(b.address);
          return sortOrder === 'asc' ? result : -result;
        });
      } else if (sortBy === 'name') {
        filtered.sort((a, b) => {
          const result = a.pavilion.localeCompare(b.pavilion);
          return sortOrder === 'asc' ? result : -result;
        });
      } else if (sortBy === 'district') {
        filtered.sort((a, b) => {
          const result = a.district.localeCompare(b.district);
          return sortOrder === 'asc' ? result : -result;
        });
      }

      return filtered;
    }
  }, [allLocations, allProfessionals, searchTerm, districtFilter, specialtyFilter, sortBy, sortOrder, isVirtualService]);

  // Paginación
  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredAndSortedItems.slice(startIndex, endIndex);

  // Reset página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, sortBy, sortOrder, districtFilter, specialtyFilter]);

  // Función para manejar el cambio de ordenamiento
  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      // Si es la misma columna, alternar el orden
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Si es una columna diferente, establecer orden ascendente
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  // Función para obtener el ícono de ordenamiento
  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="ml-1 h-3 w-3 text-gray-400" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="ml-1 h-3 w-3 text-black" />
      : <ArrowDown className="ml-1 h-3 w-3 text-black" />;
  };

  const handleLocationSelect = (location: ReservationLocation) => {
    setSelectedLocationId(location.id);
    setSelectedProfessionalId(null);
    updateReservation({ location, professional: undefined });
  };

  const handleProfessionalSelect = (professional: ReservationProfessional) => {
    setSelectedProfessionalId(professional.id);
    setSelectedLocationId(null);
    updateReservation({ professional, location: undefined });
  };

  const handleContinue = () => {
    const hasSelection = isVirtualService ? selectedProfessionalId : selectedLocationId;
    if (hasSelection) {
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
          <p className="text-gray-600">
            Cargando {isVirtualService ? 'profesionales' : 'ubicaciones'}...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">
          Error al cargar {isVirtualService ? 'los profesionales' : 'las ubicaciones'}: {error.message}
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
            {/* Título dinámico */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isVirtualService 
                  ? 'Selecciona el profesional de tu preferencia'
                  : 'Selecciona el lugar de tu preferencia'
                }
              </h1>
              <p className="text-gray-600 text-lg">
                {isVirtualService 
                  ? 'Encuentra el profesional perfecto para tu sesión virtual'
                  : 'Encuentra la ubicación perfecta para tu actividad'
                }
              </p>
            </div>

            {/* Mensaje informativo */}
            {reservationData.service && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-center max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-2">
                  {isVirtualService ? (
                    <User className="h-5 w-5 text-blue-600" />
                  ) : (
                    <MapPin className="h-5 w-5 text-blue-600" />
                  )}
                  <p className="text-blue-800 text-sm">
                    Mostrando {isVirtualService ? 'profesionales disponibles' : 'ubicaciones disponibles'} para:{' '}
                    <span className="font-semibold">
                      {reservationData.service.name}
                    </span>
                    {isVirtualService && ' (Servicio Virtual)'}
                  </p>
                </div>
              </div>
            )}

            {/* Barra de búsqueda y filtros */}
            <div className="flex flex-col lg:flex-row justify-center gap-4 max-w-5xl mx-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder={isVirtualService ? "Buscar profesional..." : "Buscar lugar específico..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="min-w-[150px] justify-between">
                      {sortBy === '' ? 'Ordenar por' : 
                       isVirtualService ? 
                         (sortBy === 'name' ? 'Profesional' : 
                          sortBy === 'specialty' ? 'Especialidad' : 
                          sortBy === 'contact' ? 'Contacto' : 'Ordenar por') :
                         (sortBy === 'address' ? 'Dirección' : 
                          sortBy === 'name' ? 'Lugar' : 
                          sortBy === 'district' ? 'Distrito' : 'Ordenar por')
                      }
                      {sortBy !== '' && getSortIcon(sortBy)}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => { setSortBy(''); setSortOrder('asc'); }}>
                      <div className="flex items-center justify-between w-full">
                        Sin ordenar
                        <ArrowUpDown className="ml-1 h-3 w-3 text-gray-400" />
                      </div>
                    </DropdownMenuItem>
                    {isVirtualService ? (
                      <>
                        <DropdownMenuItem onClick={() => handleSortChange('name')}>
                          <div className="flex items-center justify-between w-full">
                            Profesional
                            {getSortIcon('name')}
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange('specialty')}>
                          <div className="flex items-center justify-between w-full">
                            Especialidad
                            {getSortIcon('specialty')}
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange('contact')}>
                          <div className="flex items-center justify-between w-full">
                            Contacto
                            {getSortIcon('contact')}
                          </div>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => handleSortChange('address')}>
                          <div className="flex items-center justify-between w-full">
                            Dirección
                            {getSortIcon('address')}
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange('name')}>
                          <div className="flex items-center justify-between w-full">
                            Lugar
                            {getSortIcon('name')}
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange('district')}>
                          <div className="flex items-center justify-between w-full">
                            Distrito
                            {getSortIcon('district')}
                          </div>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                {isVirtualService ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="min-w-[200px] justify-between">
                        {specialtyFilter === '' ? 'Filtrar por especialidad' : specialtyFilter}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSpecialtyFilter('')}>
                        Todas las especialidades
                      </DropdownMenuItem>
                      {uniqueSpecialties.map((specialty) => (
                        <DropdownMenuItem key={specialty} onClick={() => setSpecialtyFilter(specialty)}>
                          {specialty}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="min-w-[180px] justify-between">
                        {districtFilter === '' ? 'Filtrar por distrito' : districtFilter}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setDistrictFilter('')}>
                        Todos los distritos
                      </DropdownMenuItem>
                      {uniqueDistricts.map((district) => (
                        <DropdownMenuItem key={district} onClick={() => setDistrictFilter(district)}>
                          {district}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Contador de resultados */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Resultados: {filteredAndSortedItems.length} {isVirtualService ? 'profesionales' : 'lugares'}
                {searchTerm && ` encontrados para "${searchTerm}"`}
                {(districtFilter || specialtyFilter) && ` en ${districtFilter || specialtyFilter}`}
              </p>
            </div>

            {/* Tabla dinámica */}
            {currentItems.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-20">
                          Selección
                        </th>
                        {isVirtualService ? (
                          <>
                            <th 
                              className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 select-none"
                              onClick={() => handleSortChange('name')}
                            >
                              <div className="flex items-center">
                                Profesional
                                {getSortIcon('name')}
                              </div>
                            </th>
                            <th 
                              className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 select-none"
                              onClick={() => handleSortChange('specialty')}
                            >
                              <div className="flex items-center">
                                Especialidad
                                {getSortIcon('specialty')}
                              </div>
                            </th>
                            <th 
                              className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 select-none"
                              onClick={() => handleSortChange('contact')}
                            >
                              <div className="flex items-center">
                                Contacto
                                {getSortIcon('contact')}
                              </div>
                            </th>
                          </>
                        ) : (
                          <>
                            <th 
                              className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 select-none"
                              onClick={() => handleSortChange('address')}
                            >
                              <div className="flex items-center">
                                Dirección
                                {getSortIcon('address')}
                              </div>
                            </th>
                            <th 
                              className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 select-none"
                              onClick={() => handleSortChange('name')}
                            >
                              <div className="flex items-center">
                                Lugar
                                {getSortIcon('name')}
                              </div>
                            </th>
                            <th 
                              className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 select-none"
                              onClick={() => handleSortChange('district')}
                            >
                              <div className="flex items-center">
                                Distrito
                                {getSortIcon('district')}
                              </div>
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentItems.map((item) => {
                        const isSelected = isVirtualService 
                          ? selectedProfessionalId === item.id
                          : selectedLocationId === item.id;
                        
                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                              isSelected 
                                ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                                : ''
                            }`}
                            onClick={() => {
                              if (isVirtualService) {
                                handleProfessionalSelect(item as ReservationProfessional);
                              } else {
                                handleLocationSelect(item as ReservationLocation);
                              }
                            }}
                          >
                            <td className="px-6 py-4">
                              <div className="flex justify-center">
                                <input
                                  type="radio"
                                  name="selection"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isVirtualService) {
                                      handleProfessionalSelect(item as ReservationProfessional);
                                    } else {
                                      handleLocationSelect(item as ReservationLocation);
                                    }
                                  }}
                                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                              </div>
                            </td>
                            {isVirtualService ? (
                              // Professional row
                              <>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                      {(item as ReservationProfessional).image_url ? (
                                        <img
                                          src={(item as ReservationProfessional).image_url}
                                          alt="Professional"
                                          className="w-10 h-10 rounded-full object-cover"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent && !parent.querySelector('.fallback-icon')) {
                                              const icon = document.createElement('div');
                                              icon.className = 'fallback-icon';
                                              icon.innerHTML = '<svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
                                              parent.appendChild(icon);
                                            }
                                          }}
                                        />
                                      ) : (
                                        <User className="h-5 w-5 text-gray-400" />
                                      )}
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium text-gray-900">
                                        {(item as ReservationProfessional).name} {(item as ReservationProfessional).first_last_name}
                                      </span>
                                      {(item as ReservationProfessional).second_last_name && (
                                        <span className="text-sm text-gray-900">
                                          {' '}{(item as ReservationProfessional).second_last_name}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {(item as ReservationProfessional).specialty}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900">
                                    <div>{(item as ReservationProfessional).email}</div>
                                    <div className="text-gray-500">{(item as ReservationProfessional).phone_number}</div>
                                  </div>
                                </td>
                              </>
                            ) : (
                              // Location row
                              <>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-900">
                                      {(item as ReservationLocation).address}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm font-medium text-gray-900">
                                    {(item as ReservationLocation).pavilion}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {(item as ReservationLocation).district}
                                  </span>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-gray-400 mb-4">
                  {isVirtualService ? (
                    <User className="mx-auto h-16 w-16" />
                  ) : (
                    <MapPin className="mx-auto h-16 w-16" />
                  )}
                </div>
                <p className="text-gray-500 text-lg font-medium">
                  {searchTerm || districtFilter || specialtyFilter
                    ? `No se encontraron ${isVirtualService ? 'profesionales' : 'ubicaciones'} que coincidan con tu búsqueda`
                    : `No hay ${isVirtualService ? 'profesionales' : 'ubicaciones'} disponibles`
                  }
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Intenta ajustar tus filtros de búsqueda
                </p>
              </div>
            )}

            {/* Paginación */}
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
          disabled={!(isVirtualService ? selectedProfessionalId : selectedLocationId)}
          className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-300"
        >
          Seleccionar
        </Button>
      </div>
    </div>
  );
}
