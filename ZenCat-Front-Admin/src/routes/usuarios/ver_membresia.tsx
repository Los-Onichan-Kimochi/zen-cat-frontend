import React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import HeaderDescriptor from '@/components/common/header-descriptor';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronLeft } from 'lucide-react';
import { mockMemberships, mockUsers, UserWithExtra } from '@/mocks/users';
import { useSearch } from '@tanstack/react-router';

export const Route = createFileRoute('/usuarios/ver_membresia')({
  component: VerMembresia,
});

function VerMembresia() {
  const search = useSearch({ from: '/usuarios/ver_membresia' }) as { id: string };
  const userId = search.id;

  // Encontrar el usuario por ID
  const user = mockUsers.find(u => u.id === userId);

  // Filtrado simple por comunidad
  const filteredMemberships = mockMemberships.filter((m) =>
    user?.membershipsIds?.includes(m.id)
  );

  return (
    <div className="min-h-screen bg-[#fafbfc] w-full">
      <div className="p-6 h-full">
        <HeaderDescriptor title="USUARIOS" subtitle="VER MEMBRESÍAS" />
        <div className="mb-4">
          <Button
            variant="outline"
            className="flex items-center gap-2 border rounded-lg px-4 py-2 bg-white shadow font-semibold hover:bg-neutral-100"
            onClick={() => window.history.back()}
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
              placeholder="Busca tu registro o celda"
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
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Comunidad</th>
                <th className="p-2 text-left">Tipo</th>
                <th className="p-2 text-left">Costo</th>
                <th className="p-2 text-left">Límite de reservas</th>
                <th className="p-2 text-left">Fecha de inicio</th>
                <th className="p-2 text-left">Fecha de fin</th>
                <th className="p-2 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredMemberships.map((membership) => (
                <tr key={membership.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{membership.comunidad}</td>
                  <td className="p-2">{membership.tipo}</td>
                  <td className="p-2">{membership.costo}</td>
                  <td className="p-2">{membership.limiteReservas}</td>
                  <td className="p-2">{membership.fechaInicio}</td>
                  <td className="p-2">{membership.fechaFin}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${membership.estadoColor}`}>
                      {membership.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex justify-between items-center mt-4">
          <div>Registros por página: 10</div>
          <div>1 – 10 de {filteredMemberships.length} registros</div>
          <div className="flex gap-2">
            <Button>{"<"}</Button>
            <Button>{">"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerMembresia;
