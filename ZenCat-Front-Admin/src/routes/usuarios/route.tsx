import React, { useState } from "react";
import { createFileRoute } from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/types/user";
import { Gem, Search, Trash, ChevronDown, MoreHorizontal, Plus } from 'lucide-react';
import HomeCard from "@/components/common/home-card";

// Extiende el tipo User localmente para los mocks
interface UserWithExtra extends User {
  address?: string;
  district?: string;
  phone?: string;
}

// Datos de ejemplo (ajustados para evitar errores de tipo)
const mockUsers: UserWithExtra[] = Array.from({ length: 10 }).map((_, i) => ({
  id: String(i + 1),
  name: "Carlos Zegarra",
  email: `carlos${i + 1}@mail.com`,
  role: "user",
  password: "123456",
  isAuthenticated: false,
  permissions: ["read"],
  avatar: "",
  address: "Av. Próceres 512",
  district: "San Miguel",
  phone: "911911911",
  memberships: [],
}));

export const Route = createFileRoute('/usuarios')({
  component: UsuariosComponent,
});

function UsuariosComponent() {
  const [search, setSearch] = useState("");

  // Filtrado simple
  const filteredUsers = mockUsers.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

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
            description= {mockUsers.length} 
          />
        </div>
        
        {/* Botones Agregar y Carga Masiva */}
        <div className="flex justify-end gap-3 mb-4">
          <Button
            className="bg-black text-white font-bold rounded-lg flex items-center gap-2 px-5 py-2 h-11 shadow hover:bg-gray-900 transition-all"
            onClick={() => window.location.href = '/usuarios/agregar'}
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
              placeholder="Busca tu registro o celda"
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
              {/* Dropdown menu ejemplo */}
              <div className="hidden group-hover:block absolute z-10 mt-1 w-40 bg-white border border-neutral-200 rounded shadow-lg">
                <button className="block w-full text-left px-4 py-2 hover:bg-neutral-100">Nombre</button>
                <button className="block w-full text-left px-4 py-2 hover:bg-neutral-100">Fecha</button>
              </div>
            </div>
            {/* Dropdown Filtrar por */}
            <div className="relative group">
              <Button className="h-10 bg-transparent border border-neutral-300 text-black rounded-lg hover:bg-neutral-100 focus:bg-neutral-100 shadow-sm hover:shadow-md focus:shadow-md transition-all duration-150 flex items-center gap-1 cursor-pointer">
                Filtrar por <ChevronDown className="w-4 h-4" />
              </Button>
              {/* Dropdown menu ejemplo */}
              <div className="hidden group-hover:block absolute z-10 mt-1 w-40 bg-white border border-neutral-200 rounded shadow-lg">
                <button className="block w-full text-left px-4 py-2 hover:bg-neutral-100">Activos</button>
                <button className="block w-full text-left px-4 py-2 hover:bg-neutral-100">Inactivos</button>
              </div>
            </div>
            {/* Botón Exportar */}
            <Button className="h-10 bg-transparent border border-neutral-300 text-black rounded-lg hover:bg-neutral-100 focus:bg-neutral-100 shadow-sm hover:shadow-md focus:shadow-md transition-all duration-150 cursor-pointer">
              Exportar
            </Button>
            {/* Botón Eliminar */}
            <Button className="h-10 bg-red-400 text-white flex items-center gap-2 hover:bg-red-500 rounded-lg shadow-sm hover:shadow-md focus:shadow-md transition-all duration-150 cursor-pointer">
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
                <input type="checkbox" className="mt-1.5" />
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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 align-middle flex items-center justify-center">
                    <input type="checkbox" />
                  </td>
                  <td className="p-2">{user.name}</td>
                  <td className="p-2">{user.address}</td>
                  <td className="p-2">{user.district}</td>
                  <td className="p-2">{user.phone}</td>
                  <td className="p-2">
                    <Button className="bg-black text-white rounded-md flex items-center gap-2 px-4 py-2 h-10">
                      Ver membresías
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </td>
                  <td className="p-2 flex gap-2">
                    <button className="w-9 h-9 flex items-center justify-center rounded-full border border-neutral-400 hover:bg-neutral-100 transition-colors">
                      <MoreHorizontal className="w-5 h-5 text-black" />
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-full border border-neutral-400 hover:bg-red-100 transition-colors">
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
          <div>1 – 10 de {filteredUsers.length} registros</div>
          <div className="flex gap-2">
            <Button>{"<"}</Button>
            <Button>{">"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UsuariosComponent; 