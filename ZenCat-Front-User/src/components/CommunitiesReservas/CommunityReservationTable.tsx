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
} from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Reservation, ReservationState } from '@/types/reservation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TablePagination } from '@/components/common/TablePagination';

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
    case ReservationState.CONFIRMED:
      return 'bg-yellow-100 text-yellow-800';
    case ReservationState.ANULLED:
      return 'bg-gray-100 text-gray-800';
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
    case ReservationState.CONFIRMED:
      return 'Confirmada';
    case ReservationState.ANULLED:
      return 'Anulada';
    default:
      return String(state);
  }
};

export function ReservationsTable({ data, onView }: ReservationsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [currentPage, setCurrentPage] = useState(0);

  const columns: ColumnDef<Reservation>[] = [
    {
      accessorKey: 'name',
      header: 'Servicio',
      cell: ({ row }) => (
        <div className="font-medium text-center">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'reservation_time',
      header: 'Fecha',
      cell: ({ row }) => {
        const date = new Date(row.getValue('reservation_time'));
        return (
          <div className="text-sm text-center">
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
          <div className="text-sm text-center">
            {format(reservationTime, 'HH:mm', { locale: es })} h -{' '}
            {format(endTime, 'HH:mm', { locale: es })} h
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
        return <div className="text-sm text-center">{place || 'N/A'}</div>;
      },
      enableSorting: false,
    },
    {
      accessorKey: 'teacher',
      header: 'Profesor',
      cell: ({ row }) => {
        const teacher = row.original.teacher;
        return <div className="text-sm text-center">{teacher || 'N/A'}</div>;
      },
      enableSorting: false,
    },
    {
      accessorKey: 'state',
      header: 'Estado',
      cell: ({ row }) => {
        const state = row.getValue('state') as ReservationState;
        return (
          <div className="flex justify-center">
            <Badge className={getStateColor(state)}>{getStateLabel(state)}</Badge>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Ver</span>,
      cell: ({ row }) => {
        const reservation = row.original;
        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => onView(reservation)}
              aria-label={`Ver detalles de la reserva ${reservation.name}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
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
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnVisibility,
      pagination: {
        pageIndex: currentPage,
        pageSize: 5, // Ajusta según necesites
      },
    },
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    table.setPageIndex(page);
  };

  return (
    <div className="space-y-4">
      <CommunityReservasDataTable table={table} columns={columns} />
      <TablePagination
        currentPage={currentPage}
        totalPages={table.getPageCount()}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
