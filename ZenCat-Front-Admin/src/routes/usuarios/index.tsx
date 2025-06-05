import React, { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Plus, Loader2 } from "lucide-react";
import HeaderDescriptor from '@/components/common/header-descriptor';
import { Button } from "@/components/ui/button";
import { User } from "@/types/user";
import { Gem } from 'lucide-react';
import HomeCard from "@/components/common/home-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosApi } from '@/api/usuarios/usuarios';
import { toast } from "sonner";
import { UsersTable } from '@/components/users/table';

export const Route = createFileRoute('/usuarios/')({
  component: UsuariosComponent,
});

function UsuariosComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Query para obtener usuarios
  const { data: usersData, isLoading: isLoadingUsers, error: errorUsers } = useQuery<User[], Error>({
    queryKey: ['usuarios'],
    queryFn: () => usuariosApi.getUsuarios(),
  });

  // Mutation para eliminar usuario
  const { mutate: deleteUser, isPending: isDeleting } = useMutation<void, Error, string>({
    mutationFn: (id) => usuariosApi.deleteUsuario(id),
    onSuccess: (_, id) => {
      toast.success('Usuario eliminado', { description: `Usuario eliminado exitosamente` });
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
    onError: (err) => {
      toast.error('Error al eliminar', { description: err.message });
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

  const btnSizeClasses = "h-11 w-28 px-4";

  if (errorUsers) return <p>Error cargando usuarios: {errorUsers.message}</p>;

  return (
    <div className="p-6 h-full flex flex-col">
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

      <div className="flex justify-end space-x-2 py-4">
        <Link to="/usuarios/agregar">
          <Button
            size="sm"
            className={`bg-black text-white font-bold rounded-lg flex items-center justify-between shadow hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out ${btnSizeClasses}`}
          >
            <span>Agregar</span>
            <Plus className="w-5 h-5" />
          </Button>
        </Link>

        <Button
          size="sm"
          className={`
            bg-black text-white font-bold rounded-lg
            grid grid-rows-2 grid-cols-[1fr_auto] items-center
            shadow hover:bg-gray-800 hover:scale-105 active:scale-95
            transition-all duration-200 ease-in-out
            ${btnSizeClasses}
          `}
        >
          <span className="row-start-1 col-start-1">Carga</span>
          <span className="row-start-2 col-start-1">Masiva</span>
          <Plus className="row-span-2 col-start-2 justify-self-center w-5 h-5" />
        </Button>
      </div>

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
        />
      )}

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro que deseas eliminar este usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
              <div className="mt-2 font-medium">Usuario: {userToDelete?.name}</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="space-x-2">
            <AlertDialogCancel onClick={() => setIsDeleteModalOpen(false)}>Cancelar</AlertDialogCancel>
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
    </div>
  );
}

export default UsuariosComponent; 