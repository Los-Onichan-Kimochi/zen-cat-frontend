// src/components/CommunitiesReservas/ReservationsTable.tsx

import { useState } from 'react';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Reservation, ReservationState } from '@/types/reservation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

import { CommunityReservasDataTable } from './CommunityReservasDataTable';

interface ReservationsTableProps {
  data: Reservation[];
  onView: (reservation: Reservation) => void;
}

const getStateColor = (state: ReservationState) => {
  switch (state) {
    case ReservationState.DONE:
      return 'bg-blue-100 text-blue-800';
    case ReservationState.CANCELLED:
      return 'bg-red-100 text-red-800';
    case ReservationState.ONGOING:
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStateLabel = (state: ReservationState) => {
  switch (state) {
    case ReservationState.DONE:
      return 'Completada';
    case ReservationState.CANCELLED:
      return 'Cancelada';
    case ReservationState.ONGOING:
      return 'En proceso';
    default:
      return String(state);
  }
};

export function ReservationsTable({ data, onView }: ReservationsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns: ColumnDef<Reservation>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => {
            if (value) {
                if (table.getFilteredSelectedRowModel().rows.length > 0) {
                    table.toggleAllPageRowsSelected(false);
                } else {
                    table.toggleAllPageRowsSelected(true);
                }
            } else {
                table.toggleAllPageRowsSelected(false);
            }
          }}
          aria-label="Seleccionar todo"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            if (value) {
                table.resetRowSelection();
                row.toggleSelected(true);
            } else {
                row.toggleSelected(false);
            }
          }}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: 'Servicio',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'reservation_time',
      header: 'Fecha',
      cell: ({ row }) => {
        const date = new Date(row.getValue('reservation_time'));
        return (
          <div className="text-sm">
            {format(date, 'dd/MM/yyyy', { locale: es })}
          </div>
        );
      },
    },
    {
      accessorKey: 'time_range',
      header: 'Horario',
      cell: ({ row }) => {
        const reservationTime = new Date(row.original.reservation_time);
        const endTime = new Date(reservationTime.getTime() + 60 * 60 * 1000);
        return (
          <div className="text-sm">
            {format(reservationTime, 'HH:mm', { locale: es })} h - {format(endTime, 'HH:mm', { locale: es })} h
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'place',
      header: 'Lugar',
      cell: ({ row }) => {
        const place = row.original.place;
        return (
          <div className="text-sm">{place || 'N/A'}</div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'teacher',
      header: 'Profesor',
      cell: ({ row }) => {
        const teacher = row.original.teacher;
        return (
          <div className="text-sm">{teacher || 'N/A'}</div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'state',
      header: 'Estado',
      cell: ({ row }) => {
        const state = row.getValue('state') as ReservationState;
        return (
          <Badge className={getStateColor(state)}>{getStateLabel(state)}</Badge>
        );
      },
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Ver</span>,
      cell: ({ row }) => {
        const reservation = row.original;
        return (
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => onView(reservation)}
            aria-label={`Ver detalles de la reserva ${reservation.name}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
        const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
        const selectedKeys = Object.keys(newSelection);

        if (selectedKeys.length > 1) {
            const latestSelectedKey = selectedKeys.find(key => !rowSelection[key]);
            if (latestSelectedKey) {
                setRowSelection({ [latestSelectedKey]: true });
            } else {
                setRowSelection({});
            }
        } else {
            setRowSelection(newSelection);
        }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="space-y-4">
      <CommunityReservasDataTable table={table} columns={columns} />

      {/* Contenedor principal para la paginación y el botón "Ver más" */}
      <div className="flex flex-col items-center justify-center mt-6">
        {/* Controles de paginación centrados */}
        <div className="flex items-center space-x-2 mb-4"> {/* Añadido mb-4 para separar del botón Ver más */}
          <Button
            variant="ghost"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="text-gray-600 hover:text-black"
          >
            Anterior
          </Button>
          <div className="flex gap-1">
            {Array.from({ length: table.getPageCount() }, (_, i) => (
              <Button
                key={i}
                size="sm"
                onClick={() => table.setPageIndex(i)}
                className={table.getState().pagination.pageIndex === i ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="text-gray-600 hover:text-black"
          >
            Siguiente
          </Button>
        </div>

        {/* Botón "Ver más" - Se activa si solo una fila está seleccionada */}
        <div className="flex justify-center"> {/* Este div ya estaba bien, mantiene el botón centrado */}
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            disabled={table.getFilteredSelectedRowModel().rows.length !== 1}
            onClick={() => {
              const selectedRows = table.getFilteredSelectedRowModel().rows;
              if (selectedRows.length === 1) {
                onView(selectedRows[0].original);
              }
            }}
          >
            Ver más
          </Button>
        </div>
      </div>
    </div>
  );
}