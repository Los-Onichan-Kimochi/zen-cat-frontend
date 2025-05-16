'use client';

import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { sessionsApi } from '@/api/sessions/sessions';
import { Session } from '@/types/session';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  ColumnDef,
} from '@tanstack/react-table';

import HeaderDescriptor from '@/components/common/header-descriptor';
import HomeCard from '@/components/common/home-card';
import { DataTable } from '@/components/common/data-table/data-table';
import { DataTableToolbar } from '@/components/common/data-table/data-table-toolbar';
import { DataTablePagination } from '@/components/common/data-table/data-table-pagination';
import { Button } from '@/components/ui/button';

import { Loader2, Plus, CalendarHeart, Dumbbell, Stethoscope, Upload } from 'lucide-react';

export const Route = createFileRoute('/sesiones')({
  component: SesionesPage,
});

function SesionesPage() {
  const { data: sessions, isLoading, error } = useQuery<Session[], Error>({
    queryKey: ['sessions'],
    queryFn: sessionsApi.getSessions,
  });

  const countByType = useMemo(() => {
    const yoga = sessions?.filter(s => s.service_type === 'Yoga').length || 0;
    const gym = sessions?.filter(s => s.service_type === 'Gimnasio').length || 0;
    const med = sessions?.filter(s => s.service_type === 'Cita médica').length || 0;
    return { yoga, gym, med };
  }, [sessions]);

  const columns = useMemo<ColumnDef<Session>[]>(() => [
    { accessorKey: 'id', header: 'Código' },
    { accessorKey: 'service_type', header: 'Servicio' },
    { accessorKey: 'title', header: 'Título' },
    { accessorKey: 'date', header: 'Fecha' },
    { accessorKey: 'start_time', header: 'Hora de inicio' },
    { accessorKey: 'end_time', header: 'Hora fin' },
    { accessorKey: 'available_reservations', header: 'Reservas' },
    { accessorKey: 'status', header: 'Estado' },
  ], []);

  const table = useReactTable({
    data: sessions ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="p-6 h-full flex flex-col">
      <HeaderDescriptor title="SESIONES" subtitle="LISTADO DE SESIONES" />

      <div className="flex items-center justify-center space-x-20 mt-4 font-montserrat">
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        ) : (
          <>
            <HomeCard
              icon={<CalendarHeart className="w-8 h-8 text-teal-600" />}
              iconBgColor="bg-teal-100"
              title="Sesiones de Yoga"
              description={countByType.yoga}
            />
            <HomeCard
              icon={<Dumbbell className="w-8 h-8 text-pink-600" />}
              iconBgColor="bg-pink-100"
              title="Sesiones de Gimnasio"
              description={countByType.gym}
            />
            <HomeCard
              icon={<Stethoscope className="w-8 h-8 text-blue-600" />}
              iconBgColor="bg-blue-100"
              title="Sesiones de citas médicas"
              description={countByType.med}
            />
          </>
        )}
      </div>

      <div className="flex justify-end space-x-2 py-4">
        <Link to="/sesiones/nuevo" className="h-10">
          <Button size="sm" className="h-10 bg-gray-800 font-black hover:bg-gray-700 cursor-pointer">
            <Plus className="mr-2 h-4 w-4" /> Agregar
          </Button>
        </Link>
        <Button
          size="sm"
          className="h-10 bg-gray-800 font-black hover:bg-gray-700 cursor-pointer"
          onClick={() => console.log("Carga Masiva clickeada")}
        >
          <Upload className="mr-2 h-4 w-4" /> Carga Masiva
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="-mx-4 flex-1 overflow-auto px-4 py-2">
          <DataTableToolbar
            table={table}
            filterPlaceholder="Buscar sesiones..."
            showSortButton
            showExportButton
            onExportClick={() => console.log("Exportar clickeado")}
            showFilterButton
            onFilterClick={() => console.log("Filtrar clickeado")}
          />
          <div className="flex-1 overflow-hidden rounded-md border">
            <DataTable table={table} columns={columns} />
          </div>
          <DataTablePagination table={table} />
        </div>
      )}
    </div>
  );
}
