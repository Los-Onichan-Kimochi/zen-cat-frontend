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

  // Mutation para eliminar múltiples usuarios - temporalmente deshabilitada
  // const { mutate: bulkDeleteUsers, isPending: isBulkDeleting } = useMutation<
  //   void,
  //   Error,
  //   string[]
  // >({
  //   mutationFn: (ids) => usuariosApi.bulkDeleteUsuarios(ids),
  //   onSuccess: (_, ids) => {
  //     toast.success('Usuarios Eliminados', {
  //       description: `${ids.length} usuario(s) eliminado(s) exitosamente.`,
  //     });
  //     queryClient.invalidateQueries({ queryKey: ['usuarios'] });
  //   },
  //   onError: (err) => {
  //     toast.error('Error al Eliminar Usuarios', {
  //       description: err.message || 'No se pudieron eliminar los usuarios.',
  //     });
  //   },
  // });

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

  const handleRefresh = async () => {
    const startTime = Date.now();
    
    const result = await refetchUsers();
    
    // Asegurar que pase al menos 1 segundo
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, 1000 - elapsedTime);
    
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }
    
    return result;
  };

  // const btnSizeClasses = 'h-11 w-28 px-4'; // No se usa temporalmente

  if (usersError) return <p>Error cargando usuarios: {usersError.message}</p>;

  return (
    <div className="p-6 h-screen flex flex-col font-montserrat overflow-hidden">
      <HeaderDescriptor title="USUARIOS" subtitle="LISTADO DE USUARIOS" />

      {/* Statistics Section */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center space-x-20 mt-2 font-montserrat min-h-[120px]">
          {usersData ? (
            <HomeCard
              icon={<Gem className="w-8 h-8 text-purple-600" />}
              iconBgColor="bg-purple-100"
              title="Usuarios totales"
              description={usersData.length}
              descColor="text-purple-600"
              isLoading={isFetchingUsers}
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
      </div>

      {/* Table Section */}
      <div className="flex-1 flex flex-col min-h-0">
        {isLoadingUsers ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="flex-1 flex flex-col border rounded-md bg-white p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Lista de Usuarios</h3>
              <p className="text-sm text-gray-600">
                Total: {usersData?.length || 0} usuarios
              </p>
            </div>
            
            {usersData && usersData.length > 0 ? (
              <div className="space-y-2">
                {usersData.slice(0, 10).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name || 'Sin nombre'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">
                          Rol: {user.rol === 'admin' ? 'Administrador' : user.rol === 'user' ? 'Cliente' : user.rol === 'ADMINISTRATOR' ? 'Administrador' : user.rol === 'CLIENT' ? 'Cliente' : 'Invitado'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(user)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setUserToDelete(user);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
                
                {usersData.length > 10 && (
                  <div className="text-center py-4 text-gray-500">
                    Mostrando 10 de {usersData.length} usuarios
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500">No hay usuarios disponibles</p>
              </div>
            )}
          </div>
        )}
      </div>

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
