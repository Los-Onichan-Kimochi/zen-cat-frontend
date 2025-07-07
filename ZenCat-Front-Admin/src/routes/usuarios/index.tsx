import React, { useState, useEffect, useMemo } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Loader2, Users } from 'lucide-react';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { ViewToolbar } from '@/components/common/view-toolbar';
import { User } from '@/types/user';
import { BulkCreateDialog } from '@/components/common/bulk-create-dialog';
import { CreateUserPayload } from '@/types/user';
import { Gem } from 'lucide-react';
import HomeCard from '@/components/common/home-card';
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosApi } from '@/api/usuarios/usuarios';
import { ModalNotifications } from '@/components/custom/common/modal-notifications';
import { useModalNotifications } from '@/hooks/use-modal-notifications';
import { useToast } from '@/context/ToastContext';
import { UsersTable } from '@/components/usuarios/table';

export const Route = createFileRoute('/usuarios/')({
  component: UsuariosComponent,
});

function UsuariosComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [resetSelectionTrigger, setResetSelectionTrigger] = useState(0);

  // Query para obtener usuarios
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers,
    isFetching: isFetchingUsers,
  } = useQuery<User[], Error>({
    queryKey: ['usuarios'],
    queryFn: () => usuariosApi.getUsuarios(),
  });

  const stats = useMemo(() => {
    if (!usersData)
      return {
        total_users: 0,
        admin_count: 0,
        client_count: 0,
        guest_count: 0,
      };

    const adminCount = usersData.filter(
      (user) => user.rol === 'admin' || user.rol === 'ADMINISTRATOR',
    ).length;
    const clientCount = usersData.filter(
      (user) => user.rol === 'user' || user.rol === 'CLIENT',
    ).length;
    const guestCount = usersData.filter(
      (user) => user.rol === 'guest' || user.rol === 'GUEST',
    ).length;

    return {
      total_users: usersData.length,
      admin_count: adminCount,
      client_count: clientCount,
      guest_count: guestCount,
    };
  }, [usersData]);

  // Debug effect to check onboarding data
  useEffect(() => {
    if (usersData) {
      console.log('Users data in component:', usersData);
      console.log('First user onboarding data:', usersData[0]?.onboarding);
    }
  }, [usersData]);

  // Mutation para eliminar usuario
  const { mutate: deleteUser, isPending: isDeleting } = useMutation<
    void,
    Error,
    string
  >({
    mutationFn: (id) => usuariosApi.deleteUsuario(id),
    onSuccess: (_, id) => {
      toast.success('Usuario Eliminado', {
        description: 'El usuario ha sido eliminado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
    onError: (err) => {
      toast.error('Error al Eliminar', {
        description: err.message || 'No se pudo eliminar el usuario.',
      });
    },
  });

  // Mutation para bulk delete
  const { mutate: bulkDeleteUsers, isPending: isBulkDeleting } = useMutation<
    void,
    Error,
    string[]
  >({
    mutationFn: (ids) => usuariosApi.bulkDeleteUsuarios(ids),
    onSuccess: (_, ids) => {
      toast.success('Usuarios Eliminados', {
        description: `${ids.length} usuarios eliminados exitosamente.`,
      });
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
    onError: (err) => {
      toast.error('Error al Eliminar Usuarios', {
        description: err.message || 'No se pudieron eliminar los usuarios.',
      });
    },
  });

  const handleView = (user: User) => {
    navigate({ to: '/usuarios/ver', search: { id: user.id } });
  };

  const handleViewMemberships = (user: User) => {
    navigate({ to: '/usuarios/ver_membresia', search: { id: user.id } });
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
    }
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleBulkDelete = (ids: string[]) => {
    bulkDeleteUsers(ids, {
      onSuccess: () => {
        setResetSelectionTrigger((prev) => prev + 1);
      },
    });
  };

  const handleRefresh = async () => {
    const startTime = Date.now();

    const result = await refetchUsers();

    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, 1000 - elapsedTime);

    if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }

    return result;
  };

  if (usersError) return <p>Error cargando usuarios: {usersError.message}</p>;

  return (
    <div className="p-6 h-screen flex flex-col font-montserrat overflow-hidden">
      <HeaderDescriptor title="USUARIOS" subtitle="LISTADO DE USUARIOS" />

      <div className="flex-shrink-0">
        <div className="flex items-center justify-start space-x-20 mt-2 font-montserrat min-h-[120px]">
          {isLoadingUsers ? (
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          ) : (
            <>
              <HomeCard
                icon={<Users className="w-8 h-8 text-blue-600" />}
                iconBgColor="bg-blue-100"
                title="Total Usuarios"
                description={stats.total_users}
                descColor="text-blue-600"
                isLoading={isFetchingUsers}
              />
            </>
          )}
        </div>

        <ViewToolbar
          onAddClick={() => navigate({ to: '/usuarios/agregar' })}
          onBulkUploadClick={() => setShowUploadDialog(true)} // Activa el diálogo carga masiva
          addButtonText="Agregar"
          bulkUploadButtonText="Carga Masiva"
        />
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {isLoadingUsers ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
          </div>
        ) : (
          <UsersTable
            data={usersData || []}
            isLoading={isFetchingUsers}
            onView={handleView}
            onViewMemberships={handleViewMemberships}
            onDelete={handleDelete}
            onBulkDelete={handleBulkDelete}
            isBulkDeleting={isBulkDeleting}
            onRefresh={handleRefresh}
            resetRowSelectionTrigger={resetSelectionTrigger}
          />
        )}
      </div>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar a{' '}
              {userToDelete?.name || userToDelete?.email}? Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <BulkCreateDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        title="Carga Masiva de Usuarios"
        expectedExcelColumns={[
          'Correo electrónico',
          'Nombres',
          'Primer apellido',
          'Segundo apellido',
          'Foto',
        ]}
        dbFieldNames={[
          'email',
          'name',
          'firstLastName',
          'secondLastName',
          'avatar',
        ]}
        onParsedData={async (data) => {
          try {
            const transformed = data.map((item) => ({
              email: item.email?.toString().trim(),
              name: item.name?.toString().trim(),
              password: '12345678', // Password fijo para todos (puedes personalizarlo)
              rol: 'user' as const,
              avatar: item.avatar?.toString().trim(),
              onboarding: {}, // Se deja vacío si no se usa
              first_last_name: item.firstLastName?.toString().trim(),
              second_last_name: item.secondLastName?.toString().trim(),
            }));

            await usuariosApi.bulkCreateUsuarios({ users: transformed });
            toast.success('Usuarios cargados exitosamente');
            queryClient.invalidateQueries({ queryKey: ['usuarios'] });
            setShowUploadDialog(false);
            setShowSuccess(true);
            return true;
          } catch (error: any) {
            toast.error('Error durante la carga masiva', {
              description: error.message,
            });
            return false;
          }
        }}
      />
    </div>
  );
}

export default UsuariosComponent;
