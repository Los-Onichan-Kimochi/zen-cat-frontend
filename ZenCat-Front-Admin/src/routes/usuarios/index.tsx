import React, { useState, useEffect, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Search, ChevronDown } from "lucide-react";
import HeaderDescriptor from '@/components/common/header-descriptor';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/types/user";
import { Gem, Trash, MoreHorizontal, Plus } from 'lucide-react';
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

export const Route = createFileRoute('/usuarios/')({
  component: UsuariosComponent,
});

function UsuariosComponent() {
  const [search, setSearch] = useState("");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [sortField, setSortField] = useState<keyof User>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [openOrder, setOpenOrder] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const orderRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query para obtener usuarios
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => usuariosApi.getUsuarios(),
  });

  // Mutation para eliminar usuario
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => usuariosApi.deleteUsuario(id),
    onSuccess: () => {
      toast.success("Usuario eliminado", { description: "El usuario ha sido eliminado exitosamente." });
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
    onError: (error) => {
      toast.error("Error al eliminar usuario", { description: error.message || "No se pudo eliminar el usuario." });
    },
  });

  // Mutation para eliminar usuarios en bulk
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => usuariosApi.bulkDeleteUsuarios(ids),
    onSuccess: () => {
      toast.success("Usuarios eliminados", { description: "Los usuarios han sido eliminados exitosamente." });
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
    onError: (error) => {
      toast.error("Error al eliminar usuarios", { description: error.message || "No se pudieron eliminar los usuarios." });
    },
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (orderRef.current && !orderRef.current.contains(event.target as Node)) {
        setOpenOrder(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setOpenFilter(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrar y ordenar usuarios
  const filteredAndSortedUsers = users
    .filter(user => {
      // Filtro de búsqueda
      const searchMatch = 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      // Filtro de estado
      const statusMatch = 
        filterStatus === 'all' || 
        (filterStatus === 'active' && user.isAuthenticated) ||
        (filterStatus === 'inactive' && !user.isAuthenticated);

      // Filtro de rol
      const roleMatch = 
        filterRole === 'all' || 
        user.role === filterRole;

      return searchMatch && statusMatch && roleMatch;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

  // Selección individual
  const handleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Selección global
  const handleSelectAll = () => {
    if (selectedUserIds.length === filteredAndSortedUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredAndSortedUsers.map((u) => u.id));
    }
  };

  // Borrado individual
  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
      setUserToDelete(null);
      setIsDeleteModalOpen(false);
      setSelectedUserIds((prev) => prev.filter((id) => id !== userToDelete.id));
    }
  };

  // Borrado masivo
  const handleBulkDelete = () => {
    if (selectedUserIds.length > 0) {
      setIsBulkDeleteModalOpen(true);
    }
  };

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedUserIds);
    setSelectedUserIds([]);
    setIsBulkDeleteModalOpen(false);
  };

  const closeDeleteModal = () => {
    setUserToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const closeBulkDeleteModal = () => {
    setIsBulkDeleteModalOpen(false);
  };

  const handleEditUser = (userId: string) => {
    navigate({ 
      to: '/usuarios/editar',
      search: { id: userId },
      replace: true
    });
  };

  // Función para manejar el ordenamiento
  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] w-full">
      <div className="p-6 h-full">
        <HeaderDescriptor title="USUARIOS" subtitle="LISTADO DE USUARIOS" />

        {/* Tarjeta resumen */}
        <div className="mb-6 flex items-center">
          <HomeCard
            icon={<Gem className="w-8 h-8 text-teal-600" />}
            iconBgColor="bg-teal-100"
            title="Usuarios totales"
            description={users.length} 
          />
        </div>
        
        {/* Botones Agregar y Carga Masiva */}
        <div className="flex justify-end gap-3 mb-4">
          <Button
            className="bg-black text-white font-bold rounded-lg flex items-center gap-2 px-5 py-2 h-11 shadow hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out"
            onClick={() => navigate({ to: '/usuarios/agregar' })}
          >
            Agregar <Plus className="w-5 h-5" />
          </Button>
          <Button
            className="bg-black text-white font-bold rounded-lg flex items-center gap-2 px-5 py-2 h-11 shadow hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out"
          >
            Carga Masiva <Plus className="w-5 h-5" />
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
              placeholder="Buscar por nombre, email, teléfono o distrito"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full h-10"
            />
          </div>
          {/* Botones de acción alineados a la derecha */}
          <div className="flex gap-2 items-center ml-auto">
            {/* Dropdown Ordenar por */}
            <div className="relative" ref={orderRef}>
              <Button
                className="h-10 bg-white border border-neutral-300 text-black rounded-lg hover:bg-gray-100 hover:border-gray-400 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-neutral-200 shadow-sm hover:shadow-md focus:shadow-md transition-all duration-200 ease-in-out flex items-center gap-1 cursor-pointer"
                onClick={() => setOpenOrder((prev) => !prev)}
                type="button"
              >
                Ordenar por <ChevronDown className="w-4 h-4" />
              </Button>
              {openOrder && (
                <div className="absolute z-50 mt-1 w-48 bg-white border border-neutral-200 rounded shadow-lg">
                  <button
                    type="button"
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => { handleSort('name'); setOpenOrder(false); }}
                  >
                    Nombre {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </button>
                  <button
                    type="button"
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => { handleSort('email'); setOpenOrder(false); }}
                  >
                    Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </button>
                  <button
                    type="button"
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => { handleSort('district'); setOpenOrder(false); }}
                  >
                    Distrito {sortField === 'district' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </button>
                </div>
              )}
            </div>
            {/* Dropdown Filtrar por */}
            <div className="relative" ref={filterRef}>
              <Button
                className="h-10 bg-white border border-neutral-300 text-black rounded-lg hover:bg-gray-100 hover:border-gray-400 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-neutral-200 shadow-sm hover:shadow-md focus:shadow-md transition-all duration-200 ease-in-out flex items-center gap-1 cursor-pointer"
                onClick={() => setOpenFilter((prev) => !prev)}
                type="button"
              >
                Filtrar por <ChevronDown className="w-4 h-4" />
              </Button>
              {openFilter && (
                <div className="absolute z-50 mt-1 w-48 bg-white border border-neutral-200 rounded shadow-lg">
                  <div className="px-4 py-2 font-semibold border-b">Estado</div>
                  <button
                    type="button"
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filterStatus === 'all' ? 'bg-gray-100' : ''}`}
                    onClick={() => { setFilterStatus('all'); setOpenFilter(false); }}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filterStatus === 'active' ? 'bg-gray-100' : ''}`}
                    onClick={() => { setFilterStatus('active'); setOpenFilter(false); }}
                  >
                    Activos
                  </button>
                  <button
                    type="button"
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filterStatus === 'inactive' ? 'bg-gray-100' : ''}`}
                    onClick={() => { setFilterStatus('inactive'); setOpenFilter(false); }}
                  >
                    Inactivos
                  </button>
                  <div className="px-4 py-2 font-semibold border-b">Rol</div>
                  <button
                    type="button"
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filterRole === 'all' ? 'bg-gray-100' : ''}`}
                    onClick={() => { setFilterRole('all'); setOpenFilter(false); }}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filterRole === 'admin' ? 'bg-gray-100' : ''}`}
                    onClick={() => { setFilterRole('admin'); setOpenFilter(false); }}
                  >
                    Administradores
                  </button>
                  <button
                    type="button"
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filterRole === 'user' ? 'bg-gray-100' : ''}`}
                    onClick={() => { setFilterRole('user'); setOpenFilter(false); }}
                  >
                    Usuarios
                  </button>
                </div>
              )}
            </div>
            {/* Botón Exportar */}
            <Button className="h-10 bg-white border border-neutral-300 text-black rounded-lg hover:bg-gray-100 hover:border-gray-400 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-neutral-200 shadow-sm hover:shadow-md focus:shadow-md transition-all duration-200 ease-in-out flex items-center gap-1 cursor-pointer">
              Exportar
            </Button>
            {/* Botón Eliminar */}
            <Button
              className="h-10 bg-red-400 text-white flex items-center gap-2 hover:bg-red-500 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-red-200 rounded-lg shadow-sm hover:shadow-md focus:shadow-md transition-all duration-200 ease-in-out cursor-pointer"
              onClick={handleBulkDelete}
              disabled={selectedUserIds.length === 0}
            >
              Eliminar <Trash className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left align-middle flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="mt-1.5"
                    checked={selectedUserIds.length === filteredAndSortedUsers.length && filteredAndSortedUsers.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-2 text-left">Nombres</th>
                <th className="p-2 text-left">Dirección</th>
                <th className="p-2 text-left">Distrito</th>
                <th className="p-2 text-left">Teléfono</th>
                <th className="p-2 text-left">Membresías</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 align-middle flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                    />
                  </td>
                  <td className="p-2">{user.name}</td>
                  <td className="p-2">{user.address}</td>
                  <td className="p-2">{user.district}</td>
                  <td className="p-2">{user.phone}</td>
                  <td className="p-2">
                    <Button
                      className="h-9 px-4 bg-white border border-neutral-300 text-black rounded-lg flex items-center gap-2 shadow-sm hover:bg-black hover:text-white hover:border-black hover:shadow-md transition-all duration-200"
                      onClick={() => navigate({ to: '/usuarios/ver_membresia', search: { id: user.id } })}
                    >
                      Membresías ...
                    </Button>
                  </td>
                  <td className="p-2 flex gap-2">
                    <button className="w-9 h-9 flex items-center justify-center rounded-full border border-neutral-400 hover:bg-red-100 hover:shadow-md transition-all duration-200"
                      onClick={() => handleEditUser(user.id)}>
                      <MoreHorizontal className="w-5 h-5 text-black" />
                    </button>
                    <button
                      className="w-9 h-9 flex items-center justify-center rounded-full border border-neutral-400 hover:bg-red-100 hover:shadow-md transition-all duration-200"
                      onClick={() => handleDeleteUser(user)}
                    >
                      <Trash className="w-5 h-5 text-black" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex justify-between items-center mt-4">
          <div>Registros por página: 10</div>
          <div>1 – 10 de {filteredAndSortedUsers.length} registros</div>
          <div className="flex gap-2">
            <Button>{"<"}</Button>
            <Button>{">"}</Button>
          </div>
        </div>

        {/* Modal de confirmación de borrado */}
        {isDeleteModalOpen && (
          <AlertDialog open={isDeleteModalOpen} onOpenChange={closeDeleteModal}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro que deseas eliminar este usuario?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer.<br />
                  Usuario: <b>{userToDelete?.name}</b>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={closeDeleteModal}>Cancelar</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button variant="destructive" className="bg-red-500 hover:bg-red-600" onClick={confirmDeleteUser}>Eliminar</Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Modal de confirmación de borrado masivo */}
        {isBulkDeleteModalOpen && (
          <AlertDialog open={isBulkDeleteModalOpen} onOpenChange={closeBulkDeleteModal}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro que deseas eliminar los usuarios seleccionados?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer.<br />
                  Usuarios seleccionados: <b>{selectedUserIds.length}</b>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={closeBulkDeleteModal}>Cancelar</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button variant="destructive" className="bg-red-500 hover:bg-red-600" onClick={confirmBulkDelete}>Eliminar</Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}

export default UsuariosComponent; 