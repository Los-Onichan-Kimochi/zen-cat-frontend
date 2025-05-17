import React, { useState, useEffect } from "react";
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
import { getUsers, UserWithExtra, updateUser, addNewUser, deleteUser, deleteUsers } from '@/mocks/users';

export const Route = createFileRoute('/usuarios/')({
  component: UsuariosComponent,
});

function UsuariosComponent() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserWithExtra[]>([]);
  const [userToDelete, setUserToDelete] = useState<UserWithExtra | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [sortField, setSortField] = useState<keyof UserWithExtra>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const navigate = useNavigate();

  // Cargar usuarios al montar el componente
  useEffect(() => {
    setUsers(getUsers());
  }, []);

  // Filtrar y ordenar usuarios
  const filteredAndSortedUsers = users
    .filter(user => {
      // Filtro de búsqueda
      const searchMatch = 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.phone?.toLowerCase().includes(search.toLowerCase()) ||
        user.district?.toLowerCase().includes(search.toLowerCase());

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
  const handleDeleteUser = (user: UserWithExtra) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      const updatedUsers = deleteUser(userToDelete.id);
      setUsers(updatedUsers);
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
    const updatedUsers = deleteUsers(selectedUserIds);
    setUsers(updatedUsers);
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
  const handleSort = (field: keyof UserWithExtra) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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
            className="bg-black text-white font-bold rounded-lg flex items-center gap-2 px-5 py-2 h-11 shadow hover:bg-gray-900 transition-all"
            onClick={() => navigate({ to: '/usuarios/agregar' })}
          >
            Agregar <Plus className="w-5 h-5" />
          </Button>
          <Button
            className="bg-black text-white font-bold rounded-lg flex items-center gap-2 px-5 py-2 h-11 shadow hover:bg-gray-900 transition-all"
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
            <div className="relative group">
              <Button className="h-10 bg-transparent border border-neutral-300 text-black rounded-lg hover:bg-neutral-100 focus:bg-neutral-100 shadow-sm hover:shadow-md focus:shadow-md transition-all duration-150 flex items-center gap-1 cursor-pointer">
                Ordenar por <ChevronDown className="w-4 h-4" />
              </Button>
              <div className="hidden group-hover:block absolute z-10 mt-1 w-48 bg-white border border-neutral-200 rounded shadow-lg">
                <button 
                  className="block w-full text-left px-4 py-2 hover:bg-neutral-100"
                  onClick={() => handleSort('name')}
                >
                  Nombre {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button 
                  className="block w-full text-left px-4 py-2 hover:bg-neutral-100"
                  onClick={() => handleSort('email')}
                >
                  Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button 
                  className="block w-full text-left px-4 py-2 hover:bg-neutral-100"
                  onClick={() => handleSort('district')}
                >
                  Distrito {sortField === 'district' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>
            {/* Dropdown Filtrar por */}
            <div className="relative group">
              <Button className="h-10 bg-transparent border border-neutral-300 text-black rounded-lg hover:bg-neutral-100 focus:bg-neutral-100 shadow-sm hover:shadow-md focus:shadow-md transition-all duration-150 flex items-center gap-1 cursor-pointer">
                Filtrar por <ChevronDown className="w-4 h-4" />
              </Button>
              <div className="hidden group-hover:block absolute z-10 mt-1 w-48 bg-white border border-neutral-200 rounded shadow-lg">
                <div className="px-4 py-2 font-semibold border-b">Estado</div>
                <button 
                  className={`block w-full text-left px-4 py-2 hover:bg-neutral-100 ${filterStatus === 'all' ? 'bg-neutral-100' : ''}`}
                  onClick={() => setFilterStatus('all')}
                >
                  Todos
                </button>
                <button 
                  className={`block w-full text-left px-4 py-2 hover:bg-neutral-100 ${filterStatus === 'active' ? 'bg-neutral-100' : ''}`}
                  onClick={() => setFilterStatus('active')}
                >
                  Activos
                </button>
                <button 
                  className={`block w-full text-left px-4 py-2 hover:bg-neutral-100 ${filterStatus === 'inactive' ? 'bg-neutral-100' : ''}`}
                  onClick={() => setFilterStatus('inactive')}
                >
                  Inactivos
                </button>
                <div className="px-4 py-2 font-semibold border-b">Rol</div>
                <button 
                  className={`block w-full text-left px-4 py-2 hover:bg-neutral-100 ${filterRole === 'all' ? 'bg-neutral-100' : ''}`}
                  onClick={() => setFilterRole('all')}
                >
                  Todos
                </button>
                <button 
                  className={`block w-full text-left px-4 py-2 hover:bg-neutral-100 ${filterRole === 'admin' ? 'bg-neutral-100' : ''}`}
                  onClick={() => setFilterRole('admin')}
                >
                  Administradores
                </button>
                <button 
                  className={`block w-full text-left px-4 py-2 hover:bg-neutral-100 ${filterRole === 'user' ? 'bg-neutral-100' : ''}`}
                  onClick={() => setFilterRole('user')}
                >
                  Usuarios
                </button>
              </div>
            </div>
            {/* Botón Exportar */}
            <Button className="h-10 bg-transparent border border-neutral-300 text-black rounded-lg hover:bg-neutral-100 focus:bg-neutral-100 shadow-sm hover:shadow-md focus:shadow-md transition-all duration-150 cursor-pointer">
              Exportar
            </Button>
            {/* Botón Eliminar */}
            <Button
              className="h-10 bg-red-400 text-white flex items-center gap-2 hover:bg-red-500 rounded-lg shadow-sm hover:shadow-md focus:shadow-md transition-all duration-150 cursor-pointer"
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
                  <td className="p-2 flex gap-2">
                    <button className="w-9 h-9 flex items-center justify-center rounded-full border border-neutral-400 hover:bg-neutral-100 transition-colors"
                    onClick={() => handleEditUser(user.id)}>
                      <MoreHorizontal className="w-5 h-5 text-black" />
                    </button>
                    <button
                      className="w-9 h-9 flex items-center justify-center rounded-full border border-neutral-400 hover:bg-red-100 transition-colors"
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