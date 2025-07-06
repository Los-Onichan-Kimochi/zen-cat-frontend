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
import { ChevronDown } from 'lucide-react';
import { MembershipsTable } from './CommunityMembershipTable';
import { MembershipDetailDialog } from './MembershipDetailDialog';
import { Membership, MembershipState } from '@/types/membership';
import { useAuth } from '@/context/AuthContext';
import { membershipsApi } from '@/api/memberships/memberships';
import { mapMembershipStateToSpanish } from '@/utils/membership-utils';

const CommunityMembershipsLayout = () => {
  const { communityId } = useParams({
    from: '/historial-membresias/$communityId',
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

  // --- Lógica para las Membresías ---
  const [allMemberships, setAllMemberships] = useState<Membership[]>([]);
  const [loadingMemberships, setLoadingMemberships] = useState(true);
  const [errorMemberships, setErrorMemberships] = useState<string | null>(null);

  // Estados para los filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByStatus, setFilterByStatus] = useState('');
  const [filterByPlan, setFilterByPlan] = useState('');
  
  // Estados para el dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);

  useEffect(() => {
    if (!communityId || !user?.id) {
      setErrorMemberships('Community ID o User ID no disponible.');
      setLoadingMemberships(false);
      return;
    }

    const fetchMemberships = async () => {
      setLoadingMemberships(true);
      setErrorMemberships(null);
      try {
 
        // Obtener las membresías del usuario
        const response = await membershipsApi.getMembershipsByUser(user.id!);
        
        // Filtrar solo las membresías de la comunidad actual
        const communityMemberships = response.memberships.filter(
          membership => membership.community.id === communityId
        );

        setAllMemberships(communityMemberships);
        
      } catch (error) {
        console.error('Error fetching memberships:', error);
        setErrorMemberships('Error al cargar las membresías.');
      } finally {
        setLoadingMemberships(false);
      }
    };

    fetchMemberships();
  }, [communityId, user?.id, communityName]);

  // Filtrado de membresías
  const filteredMemberships = useMemo(() => {
    let currentMemberships = [...allMemberships];

    // Filtro por término de búsqueda
    if (searchTerm) {
      currentMemberships = currentMemberships.filter((membership) => {
        const planName = membership.plan.type === 'MONTHLY' ? 'Básico' : 'Anual';
        return planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               membership.community.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Filtro por estado
    if (filterByStatus) {
      currentMemberships = currentMemberships.filter((membership) => {
        const statusText = mapMembershipStateToSpanish(membership.status);
        return statusText === filterByStatus;
      });
    }

    // Filtro por plan
    if (filterByPlan) {
      currentMemberships = currentMemberships.filter((membership) => {
        const planName = membership.plan.type === 'MONTHLY' ? 'Básico' : 'Anual';
        return planName.toLowerCase().includes(filterByPlan.toLowerCase());
      });
    }

    return currentMemberships;
  }, [
    allMemberships,
    searchTerm,
    filterByStatus,
    filterByPlan,
  ]);

  const handleViewMembership = (membership: Membership) => {
    setSelectedMembership(membership);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedMembership(null);
  };

  const handleSuspendMembership = async (membershipId: string) => {
    try {
      console.log('Suspendiendo membresía:', membershipId);
      // await membershipApi.suspendMembership(membershipId);
      
      // Actualizar el estado local
      setAllMemberships(prev => prev.map(m => 
        m.id === membershipId 
          ? { ...m, status: MembershipState.SUSPENDED }
          : m
      ));
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error al suspender membresía:', error);
      alert('Error al suspender la membresía. Por favor, inténtalo de nuevo.');
    }
  };

  const handleCancelMembership = async (membershipId: string) => {
    try {
      console.log('Cancelando membresía:', membershipId);
      // await membershipApi.cancelMembership(membershipId);
      
      // Actualizar el estado local
      setAllMemberships(prev => prev.map(m => 
        m.id === membershipId 
          ? { ...m, status: MembershipState.CANCELLED }
          : m
      ));
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error al cancelar membresía:', error);
      alert('Error al cancelar la membresía. Por favor, inténtalo de nuevo.');
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
          Aquí podrás encontrar todas las membresías de esta comunidad
        </p>
      </div>

      {/* Caja de Historial de membresías */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          Historial de membresías
        </h3>

        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            type="text"
            placeholder="Buscar membresía..."
            className="flex-grow rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Filtro por estado */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full sm:w-auto text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white flex items-center gap-2">
                {filterByStatus === '' ? 'Filtrar por estado' : filterByStatus}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterByStatus('')}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByStatus('Activa')}>
                Activa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByStatus('Suspendida')}>
                Suspendida
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByStatus('Expirada')}>
                Expirada
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByStatus('Cancelada')}>
                Cancelada
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtro por plan */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full sm:w-auto text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white flex items-center gap-2">
                {filterByPlan === '' ? 'Filtrar por plan' : filterByPlan}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterByPlan('')}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByPlan('Básico')}>
                Básico
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterByPlan('Anual')}>
                Anual
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mensaje de resultados */}
        <p className="text-sm text-gray-500 mb-4">
          Resultados: {filteredMemberships.length} membresías
        </p>

        {/* Muestra estado de carga o error */}
        {loadingMemberships ? (
          <div className="text-center py-8">Cargando membresías...</div>
        ) : errorMemberships ? (
          <div className="text-center py-8 text-red-600">
            {errorMemberships}
          </div>
        ) : (
          <>
            {filteredMemberships.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay membresías para esta comunidad que coincidan con los
                filtros.
              </div>
            ) : (
              <MembershipsTable
                data={filteredMemberships}
                onView={handleViewMembership}
              />
            )}
          </>
        )}
      </div>

      {/* Dialog de detalles de membresía */}
      <MembershipDetailDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        membership={selectedMembership}
        onSuspendMembership={handleSuspendMembership}
        onCancelMembership={handleCancelMembership}
      />
    </div>
  );
};

export default CommunityMembershipsLayout; 