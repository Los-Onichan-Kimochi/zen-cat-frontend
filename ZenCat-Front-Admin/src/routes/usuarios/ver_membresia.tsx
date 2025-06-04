import React, { useState, useRef, useEffect } from "react";
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
  const navigate = useNavigate();

  // Encontrar el usuario por ID
  const user = mockUsers.find(u => u.id === userId);

  // Filtrado simple por comunidad
  const filteredMemberships = mockMemberships.filter((m) =>
    user?.membershipsIds?.includes(m.id)
  );

  // Estado para los dropdowns
  const [openOrder, setOpenOrder] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  // Cierra el dropdown si haces click fuera
  const orderRef = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (orderRef.current && !orderRef.current.contains(event.target)) {
        setOpenOrder(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setOpenFilter(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            <div className="relative" ref={orderRef}>
              <Button
                className="h-10 bg-white border border-neutral-300 text-black rounded-lg hover:bg-neutral-100 hover:border-neutral-400 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-neutral-200 shadow-sm hover:shadow-md focus:shadow-md transition-all duration-200 ease-in-out flex items-center gap-1 cursor-pointer"
                onClick={() => setOpenOrder((prev) => !prev)}
                type="button"
              >
                Ordenar por <ChevronDown className="w-4 h-4" />
              </Button>
              {openOrder && (
                <div className="absolute z-50 mt-1 w-40 bg-white border border-neutral-200 rounded shadow-lg">
                  <button
                    type="button"
                    className="block w-full text-left px-4 py-2 hover:bg-gray-300"
                    onClick={() => { /* falta logica para ordenar */ }}
                  >
                    Nombre
                  </button>
                  <button
                    type="button"
                    className="block w-full text-left px-4 py-2 hover:bg-gray-300"
                    onClick={() => { /* falta logica para ordenar */ }}
                  >
                    Fecha
                  </button>
                </div>
              )}
            </div>
            {/* Dropdown Filtrar por */}
            <div className="relative" ref={filterRef}>
              <Button
                className="h-10 bg-white border border-neutral-300 text-black rounded-lg hover:bg-neutral-100 hover:border-neutral-400 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-neutral-200 shadow-sm hover:shadow-md focus:shadow-md transition-all duration-200 ease-in-out flex items-center gap-1 cursor-pointer"
                onClick={() => setOpenFilter((prev) => !prev)}
                type="button"
              >
                Filtrar por <ChevronDown className="w-4 h-4" />
              </Button>
              {openFilter && (
                <div className="absolute z-50 mt-1 w-40 bg-white border border-neutral-200 rounded shadow-lg">
                  <button
                    type="button"
                    className="block w-full text-left px-4 py-2 hover:bg-gray-300"
                    onClick={() => { /* falta logica para ordenar */ }}
                  >
                    <span className="px-2 py-1 rounded-full text-xs bg-green-50 text-green-600">
                      Activo
                    </span>
                  </button>
                  <button
                    type="button"
                    className="block w-full text-left px-4 py-2 hover:bg-gray-300"
                    onClick={() => { /* falta logica para ordenar */ }}
                  >
                    Inactivos
                  </button>
                </div>
              )}
            </div>
            {/* Botón Exportar */}
            <Button className="h-10 bg-white border border-neutral-300 text-black rounded-lg hover:bg-neutral-100 hover:border-neutral-400 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-neutral-200 shadow-sm hover:shadow-md focus:shadow-md transition-all duration-200 ease-in-out flex items-center gap-1 cursor-pointer">
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
