import React, { useState } from "react";
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronLeft } from 'lucide-react';
import { mockUsers, mockMemberships, UserWithExtra } from './index';
import { useSearch } from '@tanstack/react-router';
/*
// Mock de membresías
const mockMemberships = [
  {
    id: 1,
    comunidad: "Runners",
    tipo: "Mensual",
    costo: "$ 150",
    limiteReservas: "10",
    fechaInicio: "12 - 04 - 2025",
    fechaFin: "12 - 05 - 2025",
    estado: "Activo",
    estadoColor: "bg-green-400"
  },
  {
    id: 2,
    comunidad: "Los magníficos",
    tipo: "Anual",
    costo: "$ 1500",
    limiteReservas: "ilimitado",
    fechaInicio: "12 - 04 - 2025",
    fechaFin: "12 - 04 - 2026",
    estado: "Activo",
    estadoColor: "bg-green-400"
  },
  {
    id: 3,
    comunidad: "Egresados PUCP",
    tipo: "Mensual",
    costo: "$ 200",
    limiteReservas: "ilimitado",
    fechaInicio: "12 - 04 - 2025",
    fechaFin: "12 - 05 - 2025",
    estado: "Suspendida temporal",
    estadoColor: "bg-yellow-400"
  },
];
*/
export const Route = createFileRoute('/usuarios/ver_membresia')({
  component: RouteComponent,
});
function RouteComponent() {
  const navigate = useNavigate();
  const params = Route.useParams() as { id: string };
  const userId = params.id;
  const user = mockUsers.find((u: UserWithExtra) => u.id === userId);

  const [search, setSearch] = useState("");

  // Filtrado simple por comunidad
  const filteredMemberships = mockMemberships.filter((m) =>
    user?.membershipsIds?.includes(m.id)
  );

  return (
    <div className="min-h-screen bg-white w-full">
      <div className="p-6 h-full">
        <HeaderDescriptor title="USUARIOS" subtitle="VER MEMBRESÍAS" />
        
        {/* Botón Volver alineado a la izquierda, debajo del header */}
        <div className="mb-4">
          <Button
            variant="outline"
            className="flex items-center gap-2 border rounded-lg px-4 py-2 bg-white shadow font-semibold hover:bg-neutral-100"
            onClick={() => navigate({ to: '/usuarios' })}
          >
            <ChevronLeft className="w-5 h-5" />
            Volver
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <div className="mb-4 text-lg font-semibold">Membresías</div>

          {/* Barra de acciones */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 w-full">
            {/* Input de búsqueda con ícono */}
            <div className="relative w-full md:w-80">
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
                <Button className="h-10 bg-neutral-100 border border-neutral-300 text-black rounded-lg hover:bg-neutral-200 focus:bg-neutral-200 shadow-sm flex items-center gap-1 cursor-pointer">
                  Ordenar por <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
              {/* Dropdown Filtrar por */}
              <div className="relative group">
                <Button className="h-10 bg-neutral-100 border border-neutral-300 text-black rounded-lg hover:bg-neutral-200 focus:bg-neutral-200 shadow-sm flex items-center gap-1 cursor-pointer">
                  Filtrar por <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
              {/* Botón Exportar */}
              <Button className="h-10 bg-neutral-100 border border-neutral-300 text-black rounded-lg hover:bg-neutral-200 focus:bg-neutral-200 shadow-sm cursor-pointer">
                Exportar
              </Button>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto bg-white rounded-lg">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left align-middle flex items-center justify-center">
                    <input type="checkbox" className="mt-1.5" />
                  </th>
                  <th className="p-2 text-left">Comunidad</th>
                  <th className="p-2 text-left">Tipo</th>
                  <th className="p-2 text-left">Costo</th>
                  <th className="p-2 text-left">Límite de reservas</th>
                  <th className="p-2 text-left">Fecha de inicio</th>
                  <th className="p-2 text-left">Fecha fin</th>
                  <th className="p-2 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredMemberships.map((m) => (
                  <tr key={m.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 align-middle flex items-center justify-center">
                      <input type="checkbox" />
                    </td>
                    <td className="p-2">{m.comunidad}</td>
                    <td className="p-2">{m.tipo}</td>
                    <td className="p-2">{m.costo}</td>
                    <td className="p-2">{m.limiteReservas}</td>
                    <td className="p-2">{m.fechaInicio}</td>
                    <td className="p-2">{m.fechaFin}</td>
                    <td className="p-2 flex items-center gap-2">
                      <span>{m.estado}</span>
                      <span className={`w-3 h-3 rounded-full inline-block ${m.estadoColor}`}></span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-2">
            <div>Registros por página: 10</div>
            <div>1 – {filteredMemberships.length} de {filteredMemberships.length} registros</div>
            <div className="flex gap-2">
              <Button>{"<"}</Button>
              <Button>{">"}</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RouteComponent;
