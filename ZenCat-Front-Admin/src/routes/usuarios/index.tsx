import React, { useState, useEffect } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { ViewToolbar } from '@/components/common/view-toolbar';

import { Button } from '@/components/ui/button';
import { User } from '@/types/user';
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
import { UsersTable } from '@/components/users/table';
import { useBulkDelete } from '@/hooks/use-bulk-delete';
import { useToast } from '@/context/ToastContext';

export const Route = createFileRoute('/usuarios/')({
  component: UsuariosComponent,
});

function UsuariosComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { modal, error, closeModal } = useModalNotifications();
  const toast = useToast();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [resetSelection, setResetSelection] = useState(0); // Counter to trigger reset

  // Query para obtener usuarios
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: errorUsers,
  } = useQuery<User[], Error>({
    queryKey: ['usuarios'],
    queryFn: () => usuariosApi.getUsuarios(),
  });

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

  // Mutation para eliminar múltiples usuarios
  const { mutate: bulkDeleteUsers, isPending: isBulkDeleting } = useMutation<
    void,
    Error,
    string[]
  >({
    mutationFn: (ids) => usuariosApi.bulkDeleteUsuarios(ids),
    onSuccess: (_, ids) => {
      toast.success('Usuarios Eliminados', {
        description: `${ids.length} usuario(s) eliminado(s) exitosamente.`,
      });
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      // Resetear selección después de eliminación exitosa
      setResetSelection((prev) => prev + 1);
    },
    onError: (err) => {
      toast.error('Error al Eliminar Usuarios', {
        description: err.message || 'No se pudieron eliminar los usuarios.',
      });
    },
  });

  const handleEdit = (user: User) => {
    navigate({
      to: '/usuarios/editar',
      search: { id: user.id },
      replace: true,
    });
  };

  const handleViewMemberships = (user: User) => {
    navigate({ to: '/usuarios/ver_membresia', search: { id: user.id } });
  };

  const btnSizeClasses = 'h-11 w-28 px-4';

  if (errorUsers) return <p>Error cargando usuarios: {errorUsers.message}</p>;

  return (
    <div className="p-6 h-full flex flex-col font-montserrat">
      <HeaderDescriptor title="USUARIOS" subtitle="LISTADO DE USUARIOS" />

      <div className="flex items-center justify-center space-x-20 mt-2 font-montserrat min-h-[120px]">
        {usersData ? (
          <HomeCard
            icon={<Gem className="w-8 h-8 text-teal-600" />}
            iconBgColor="bg-teal-100"
            title="Usuarios totales"
            description={usersData.length}
          />
        ) : (
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        )}
      </div>

      <ViewToolbar
        onAddClick={() => navigate({ to: '/usuarios/agregar' })}
        onBulkUploadClick={() => {}}
        addButtonText="Agregar"
        bulkUploadButtonText="Carga Masiva"
      />

      {isLoadingUsers ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
        </div>
      ) : (
        <UsersTable
          data={usersData || []}
          onEdit={handleEdit}
          onDelete={(u) => {
            setUserToDelete(u);
            setIsDeleteModalOpen(true);
          }}
          onViewMemberships={handleViewMemberships}
          onBulkDelete={bulkDeleteUsers}
          isBulkDeleting={isBulkDeleting}
          resetSelection={resetSelection}
        />
      )}

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Estás seguro que deseas eliminar este usuario?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
              <div className="mt-2 font-medium">
                Usuario: {userToDelete?.name}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="space-x-2">
            <AlertDialogCancel onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                className="bg-red-400 text-white flex items-center gap-2 hover:bg-red-500 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-red-200 rounded-lg shadow-sm hover:shadow-md focus:shadow-md transition-all duration-200 ease-in-out"
                onClick={() => {
                  if (userToDelete) deleteUser(userToDelete.id);
                  setIsDeleteModalOpen(false);
                }}
              >
                Eliminar
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ModalNotifications modal={modal} onClose={closeModal} />
    </div>
  );
}

export default UsuariosComponent;
