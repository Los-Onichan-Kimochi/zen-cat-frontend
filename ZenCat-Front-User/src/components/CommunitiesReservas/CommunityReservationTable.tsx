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
import { Eye, Calendar, Clock, MapPin, User } from 'lucide-react';
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
      return 'bg-green-100 text-green-800';
    case ReservationState.ANULLED:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStateLabel = (state: ReservationState) => {
  switch (state) {
    case ReservationState.DONE:
      return 'Finalizada';
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
      accessorKey: 'service_name',
      header: 'Servicio',
      cell: ({ row }) => (
        <div className="text-sm text-center font-medium">{row.original.service_name || 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'session.title',
      header: 'Título de la sesión',
      cell: ({ row }) => (
        <div className="text-sm text-center">{row.original.session?.title || 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'reservation_time',
      header: 'Fecha',
      cell: ({ row }) => {
        const date = new Date(row.original.session.date);
        return (
          <div className="text-sm text-center">
            <div className="flex items-center justify-center gap-1">
              <Calendar className="h-3 w-3 text-gray-500" />
              {format(date, 'dd/MM/yyyy', { locale: es })}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'time_range',
      header: 'Horario',
      cell: ({ row }) => {
        const startTime = new Date(row.original.session.start_time);
        const endTime = new Date(row.original.session.end_time);
        return (
          <div className="text-sm text-center">
            <div className="flex items-center justify-center gap-1">
              <Clock className="h-3 w-3 text-gray-500" />
              {startTime.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })} - {endTime.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </div>
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
          <div className="text-sm text-center">
            <div className="flex items-center justify-center gap-1">
              <MapPin className="h-3 w-3 text-gray-500" />
              {place || 'N/A'}
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'professional',
      header: 'Profesional',
      cell: ({ row }) => {
        const professional = row.original.professional;
        return (
          <div className="text-sm text-center">
            <div className="flex items-center justify-center gap-1">
              <User className="h-3 w-3 text-gray-500" />
              {professional || 'N/A'}
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'state',
      header: 'Estado',
      cell: ({ row }) => {
        const state = row.original.state as ReservationState;
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
              variant="outline"
              size="sm"
              className="flex items-center gap-2 px-3 py-1 hover:bg-gray-50"
              onClick={() => onView(reservation)}
              aria-label={`Ver detalles de la reserva ${reservation.name}`}
            >
              <Eye className="h-4 w-4" />
              Ver detalle
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
