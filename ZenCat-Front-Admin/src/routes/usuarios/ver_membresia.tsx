import React, { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronLeft, Loader2, RefreshCw } from 'lucide-react';
import { useSearch } from '@tanstack/react-router';
import { membershipsApi, UserMembership } from '@/api/memberships/memberships';
import { usuariosApi } from '@/api/usuarios/usuarios';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/context/ToastContext';
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

export const Route = createFileRoute('/usuarios/ver_membresia')({
  component: VerMembresia,
});

function VerMembresia() {
  const search = useSearch({ from: '/usuarios/ver_membresia' }) as {
    id: string;
  };
  const userId = search.id;
  const navigate = useNavigate();

  // Obtener datos del usuario
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: ['usuario', userId],
    queryFn: () => usuariosApi.getUsuarioById(userId),
    enabled: !!userId,
  });

  // Obtener membresías del usuario
  const {
    data: memberships = [],
    isLoading: isLoadingMemberships,
    error: membershipsError,
    refetch: refetchMemberships,
  } = useQuery({
    queryKey: ['user-memberships', userId],
    queryFn: () => membershipsApi.getUserMemberships(userId),
    enabled: !!userId,
  });

  // Estado para la búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar membresías por término de búsqueda
  const filteredMemberships = memberships.filter(
    (membership) =>
      membership.community?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      membership.plan?.type?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch {
      return dateString;
    }
  };

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'suspended':
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-700';
      case 'expired':
        return 'bg-red-100 text-red-700';
      case 'inactive':
        return 'bg-gray-300 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Función para traducir el estado
  const translateStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Activo';
      case 'suspended':
      case 'on_hold':
        return 'Suspendido';
      case 'expired':
        return 'Expirado';
      case 'inactive':
        return 'Inactivo';
      default:
        return status;
    }
  };

  // Función para traducir el tipo de plan
  const translatePlanType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'monthly':
        return 'Mensual';
      case 'yearly':
        return 'Anual';
      case 'quarterly':
        return 'Trimestral';
      case 'semi-annual':
        return 'Semestral';
      default:
        return type;
    }
  };

  // Toast & react-query
  const toast = useToast();
  const queryClient = useQueryClient();

  // Estado de carga y confirmación
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pendingChange, setPendingChange] = useState<{
    membership: UserMembership;
    newStatus: 'active' | 'inactive';
  } | null>(null);

  // Mutation para actualizar estado
  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: 'inactive' | 'active';
    }) => {
      setUpdatingId(id);
      return membershipsApi.updateMembershipStatus(id, status);
    },
    onSuccess: () => {
      toast.success('Membresía actualizada', {
        description: 'La membresía ha sido actualizada exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['user-memberships', userId] });
    },
    onError: (error: any) => {
      toast.error('Error al actualizar membresía', {
        description: error.message || 'No se pudo actualizar la membresía.',
      });
    },
    onSettled: () => setUpdatingId(null),
  });

  const handleToggle = (membership: UserMembership, checked: boolean) => {
    const newStatus: 'active' | 'inactive' = checked ? 'active' : 'inactive';
    if (membership.status.toLowerCase() === newStatus) return;
    setPendingChange({ membership, newStatus });
  };

  const confirmChange = () => {
    if (!pendingChange) return;
    updateStatusMutation.mutate({
      id: pendingChange.membership.id,
      status: pendingChange.newStatus,
    });
    setPendingChange(null);
  };

  if (isLoadingUser || isLoadingMemberships) {
    return (
      <div className="min-h-screen bg-[#fafbfc] w-full flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
      </div>
    );
  }

  if (userError || membershipsError) {
    return (
      <div className="min-h-screen bg-[#fafbfc] w-full">
        <div className="p-6 h-full">
          <HeaderDescriptor title="USUARIOS" subtitle="VER MEMBRESÍAS" />
          <div className="mb-4">
            <Button
              className="h-10 bg-white border border-neutral-300 text-black rounded-lg hover:bg-neutral-100 hover:border-neutral-400 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-neutral-200 shadow-sm hover:shadow-md focus:shadow-md transition-all duration-200 ease-in-out flex items-center gap-2"
              onClick={() => navigate({ to: '/usuarios' })}
            >
              <ChevronLeft className="w-5 h-5" />
              Volver
            </Button>
          </div>
          <div className="text-center text-red-600">
            <p>
              Error cargando los datos:{' '}
              {userError?.message || membershipsError?.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] w-full">
      <div className="p-6 h-full">
        <HeaderDescriptor
          title="USUARIOS"
          subtitle={`VER MEMBRESÍAS - ${user?.name || 'Usuario'}`}
        />
        <div className="mb-4">
          <Button
            className="h-10 bg-white border border-neutral-300 text-black rounded-lg hover:bg-black hover:text-white hover:border-black hover:shadow-sm active:scale-95 focus:ring-2 focus:ring-neutral-200 transition-all duration-200 ease-in-out flex items-center gap-2"
            onClick={() => navigate({ to: '/usuarios' })}
          >
            <ChevronLeft className="w-5 h-5" />
            Volver
          </Button>
        </div>

        {/* Barra de acciones */}
        <div className="flex items-center justify-between gap-2 mb-4 w-full">
          {/* Input de búsqueda con ícono */}
          <div className="relative w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search className="w-5 h-5" />
            </span>
            <Input
              placeholder="Buscar por comunidad o tipo de plan"
              className="pl-10 w-full h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Botones de acción alineados a la derecha */}
          <div className="flex gap-2 items-center ml-auto">
            {/* Botón Actualizar */}
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 border-neutral-300 text-black rounded-lg hover:bg-neutral-100 hover:border-neutral-400 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-neutral-200 shadow-sm hover:shadow-md focus:shadow-md transition-all duration-200 ease-in-out"
              onClick={() => refetchMemberships()}
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  Comunidad
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  Plan
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  Costo
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  Límite de reservas
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  Inicio
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  Fin
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  Estado
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMemberships.length > 0 ? (
                filteredMemberships.map((membership) => (
                  <tr key={membership.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-center text-sm text-gray-900">
                      {membership.community?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900">
                      {membership.plan?.type
                        ? translatePlanType(membership.plan.type)
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900">
                      {membership.plan?.fee != null
                        ? `$${membership.plan.fee}`
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900">
                      {membership.plan?.reservation_limit === null
                        ? 'Ilimitado'
                        : membership.plan?.reservation_limit || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900">
                      {formatDate(membership.start_date)}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900">
                      {formatDate(membership.end_date)}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(membership.status)}`}
                      >
                        {translateStatus(membership.status)}
                      </span>
                    </td>
                    {/* Toggle */}
                    <td className="px-4 py-3 text-center text-sm">
                      <Switch
                        checked={membership.status.toLowerCase() === 'active'}
                        onCheckedChange={(checked) =>
                          handleToggle(membership, checked)
                        }
                        className={
                          updatingId === membership.id ||
                          (pendingChange &&
                            pendingChange.membership.id === membership.id)
                            ? 'opacity-50 pointer-events-none'
                            : ''
                        }
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    {searchTerm
                      ? 'No se encontraron membresías que coincidan con la búsqueda'
                      : 'Este usuario no tiene membresías registradas'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Información de registros */}
        <div className="flex justify-between items-center mt-4">
          <div>Total de membresías: {filteredMemberships.length}</div>
          <div>
            {filteredMemberships.length > 0 &&
              `Mostrando ${filteredMemberships.length} de ${memberships.length} registros`}
          </div>
        </div>

        {/* Diálogo de confirmación */}
        <AlertDialog
          open={pendingChange !== null}
          onOpenChange={() => setPendingChange(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {pendingChange?.newStatus === 'inactive'
                  ? '¿Cancelar membresía?'
                  : '¿Reactivar membresía?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {pendingChange?.newStatus === 'inactive'
                  ? 'Esto cancelará la membresía seleccionada. Esta acción no se puede deshacer.'
                  : 'Esto reactivará la membresía seleccionada para que vuelva a estar activa.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Volver</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  variant="default"
                  onClick={confirmChange}
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending
                    ? 'Procesando...'
                    : 'Confirmar'}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default VerMembresia;
