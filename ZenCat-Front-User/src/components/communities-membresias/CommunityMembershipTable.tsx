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
import { Eye, Calendar, CreditCard, BarChart3, Award } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Membership, MembershipState } from '@/types/membership';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TablePagination } from '@/components/common/TablePagination';
import {
  mapMembershipStateToSpanish,
  getStatusColor,
} from '@/utils/membership-utils';

import { CommunityMembershipsDataTable } from './CommunityMembershipsDataTable';

interface MembershipsTableProps {
  data: Membership[];
  onView: (membership: Membership) => void;
}

const getStateLabel = (state: MembershipState) => {
  return mapMembershipStateToSpanish(state);
};

export function MembershipsTable({ data, onView }: MembershipsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [currentPage, setCurrentPage] = useState(0);

  const columns: ColumnDef<Membership>[] = [
    {
      accessorKey: 'start_date',
      header: 'Fecha de inicio',
      cell: ({ row }) => {
        const date = new Date(row.getValue('start_date'));
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
      accessorKey: 'end_date',
      header: 'Fecha de fin',
      cell: ({ row }) => {
        const date = new Date(row.getValue('end_date'));
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
      accessorKey: 'plan.type',
      header: 'Plan seleccionado',
      cell: ({ row }) => {
        const planType = row.original.plan.type;
        const planName = planType === 'MONTHLY' ? 'Básico' : 'Anual';
        return (
          <div className="text-sm text-center">
            <div className="flex items-center justify-center gap-1">
              <Award className="h-3 w-3 text-gray-500" />
              <span className="font-medium">{planName}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'plan.fee',
      header: 'Monto pagado',
      cell: ({ row }) => {
        const amount = row.original.plan.fee;
        return (
          <div className="text-sm text-center">
            <div className="flex items-center justify-center gap-1">
              <CreditCard className="h-3 w-3 text-gray-500" />
              <span className="font-semibold text-green-700">
                S/. {amount.toFixed(2)}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'reservations_used',
      header: 'Reservas usadas',
      cell: ({ row }) => {
        const used = row.original.reservations_used || 0;
        const limit = row.original.plan.reservation_limit;

        // Si limit es null o 0, significa sin límite
        const hasLimit = limit !== null && limit > 0;
        const limitText = hasLimit ? limit.toString() : 'Sin límite';
        const percentage = hasLimit ? (used / limit) * 100 : 0;
        const isNearLimit = hasLimit && percentage > 80;

        return (
          <div className="text-sm text-center">
            <div className="flex items-center justify-center gap-1">
              <BarChart3 className="h-3 w-3 text-gray-500" />
              <span className="font-medium">{used}</span>
              <span className="text-gray-500">/ {limitText}</span>
              {hasLimit && (
                <span
                  className={`ml-1 text-xs ${isNearLimit ? 'text-orange-600' : 'text-gray-400'}`}
                >
                  ({Math.round(percentage)}%)
                </span>
              )}
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = row.original.status;
        const statusText = getStateLabel(status);
        return (
          <div className="flex justify-center">
            <Badge className={getStatusColor(status)}>{statusText}</Badge>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Ver</span>,
      cell: ({ row }) => {
        const membership = row.original;
        return (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 px-3 py-1 hover:bg-gray-50"
              onClick={() => onView(membership)}
              aria-label={`Ver detalles de la membresía ${membership.id}`}
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
        pageSize: 5, // Mismo tamaño que reservas
      },
    },
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    table.setPageIndex(page);
  };

  return (
    <div className="space-y-4">
      <CommunityMembershipsDataTable table={table} columns={columns} />
      <TablePagination
        currentPage={currentPage}
        totalPages={table.getPageCount()}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
