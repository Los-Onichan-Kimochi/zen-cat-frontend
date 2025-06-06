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
import { Eye, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Reservation, ReservationState } from '@/types/reservation';
import { DataTable } from '@/components/common/data-table/data-table';
import { DataTableToolbar } from '@/components/common/data-table/data-table-toolbar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface ReservationsTableProps {
  data: Reservation[];
  onView: (reservation: Reservation) => void;
  onEdit: (reservation: Reservation) => void;
  onDelete: (reservation: Reservation) => void;
  onBulkDelete?: (reservations: Reservation[]) => void;
  isBulkDeleting?: boolean;
}

const getStateColor = (state: ReservationState) => {
  switch (state) {
    case ReservationState.CONFIRMED:
      return 'bg-green-100 text-green-800';
    case ReservationState.DONE:
      return 'bg-blue-100 text-blue-800';
    case ReservationState.CANCELLED:
      return 'bg-red-100 text-red-800';
    case ReservationState.ANULLED:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStateLabel = (state: ReservationState) => {
  switch (state) {
    case ReservationState.CONFIRMED:
      return 'Confirmada';
    case ReservationState.DONE:
      return 'Completada';
    case ReservationState.CANCELLED:
      return 'Cancelada';
    case ReservationState.ANULLED:
      return 'Anulada';
    default:
      return state;
  }
};

export function ReservationsTable({
  data,
  onView,
  onEdit,
  onDelete,
  onBulkDelete,
  isBulkDeleting = false,
}: ReservationsTableProps) {
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
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todo"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: 'Nombre',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'user_name',
      header: 'Usuario',
      cell: ({ row }) => {
        const userName = row.original.user_name;
        const userEmail = row.original.user_email;
        return (
          <div>
            <div className="font-medium">{userName || 'Usuario desconocido'}</div>
            {userEmail && (
              <div className="text-sm text-gray-500">{userEmail}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'state',
      header: 'Estado',
      cell: ({ row }) => {
        const state = row.getValue('state') as ReservationState;
        return (
          <Badge className={getStateColor(state)}>
            {getStateLabel(state)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'reservation_time',
      header: 'Fecha de Reserva',
      cell: ({ row }) => {
        const date = new Date(row.getValue('reservation_time'));
        return (
          <div className="text-sm">
            {format(date, 'dd/MM/yyyy HH:mm', { locale: es })}
          </div>
        );
      },
    },
    {
      accessorKey: 'last_modification',
      header: 'Última Modificación',
      cell: ({ row }) => {
        const date = new Date(row.getValue('last_modification'));
        return (
          <div className="text-sm text-gray-500">
            {format(date, 'dd/MM/yyyy HH:mm', { locale: es })}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const reservation = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(reservation)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(reservation)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(reservation)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
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
      <DataTableToolbar
        table={table}
        filterPlaceholder="Buscar reservas..."
        showSortButton
        showFilterButton
        showExportButton
        onFilterClick={() => console.log('Filtrar')}
        exportFileName="reservas"
        // Bulk delete functionality
        showBulkDeleteButton={!!onBulkDelete}
        onBulkDelete={
          onBulkDelete
            ? (ids: string[]) => {
                const reservationsToDelete = data.filter((reservation) =>
                  ids.includes(reservation.id),
                );
                onBulkDelete(reservationsToDelete);
              }
            : undefined
        }
        isBulkDeleting={isBulkDeleting}
      />
      <DataTable table={table} columns={columns} />
    </div>
  );
} 