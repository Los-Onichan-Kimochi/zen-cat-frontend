'use client';

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { Loader2, ChevronLeft } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { membershipPlansApi } from '@/api/membership-plans/membership-plans';
import { MembershipPlan } from '@/types/membership-plan';
import { DataTable } from '@/components/common/data-table/data-table';
import { DataTableToolbar } from '@/components/common/data-table/data-table-toolbar';
import { DataTablePagination } from '@/components/common/data-table/data-table-pagination';
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
} from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { communityMembershipPlansApi } from '@/api/communities/community-membership-plans';

export const Route = createFileRoute('/comunidades/agregar-planes-membresía')({
  component: AddCommunityMembershipPlanPageComponent,
});

function AddCommunityMembershipPlanPageComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const mode = sessionStorage.getItem('modeAddMembershipPlan');
  const membershipPlansAsociated: string[] = JSON.parse(
    sessionStorage.getItem('draftSelectedMembershipPlans') ?? '[]',
  ).map((plan: MembershipPlan) => plan.id);
  const currentCommunityId = sessionStorage.getItem('currentCommunity'); // guardado previamente

  const redirectPath =
    mode === 'editar' ? '/comunidades/ver' : '/comunidades/agregar-comunidad';

  const {
    data: membershipPlansData,
    isLoading: isLoadingMembershipPlans,
    error: errorMembershipPlans,
  } = useQuery<MembershipPlan[], Error>({
    queryKey: ['membershipPlans'],
    queryFn: membershipPlansApi.getMembershipPlans,
  });

  // Handler para el botón Cancelar
  const handleCancel = () => {
    if (mode === 'editar' && currentCommunityId) {
      navigate({ to: redirectPath, search: { id: currentCommunityId } });
    } else {
      navigate({ to: redirectPath });
    }
  };

  const handleGuardar = async () => {
    const selectedPlans = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);

    if (mode === 'editar') {
      const newPlans = selectedPlans.filter(
        (plan) => !membershipPlansAsociated.includes(plan.id),
      );

      if (newPlans.length > 0) {
        if (!currentCommunityId) {
          alert('Falta el ID de la comunidad');
          return;
        }

        const payload = newPlans.map((p) => ({
          community_id: currentCommunityId,
          plan_id: p.id,
        }));

        try {
          await communityMembershipPlansApi.bulkCreateCommunityMembershipPlans({
            community_plans: payload,
          });
          await queryClient.invalidateQueries({
            queryKey: ['community-plans', currentCommunityId],
          });
        } catch (error) {
          console.error('Error al guardar nuevos planes:', error);
          return;
        }
      }

      sessionStorage.removeItem('modeAddMembershipPlan');
      sessionStorage.removeItem('draftSelectedMembershipPlans');

      navigate({ to: redirectPath, search: { id: currentCommunityId } });
    } else {
      sessionStorage.setItem(
        'draftSelectedMembershipPlans',
        JSON.stringify(selectedPlans),
      );
      navigate({ to: redirectPath });
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem('draftSelectedMembershipPlans');
    console.log(stored);
    if (stored && membershipPlansData) {
      const restored = JSON.parse(stored) as MembershipPlan[];
      const newRowSelection: Record<string, boolean> = {};
      restored.forEach((plan) => {
        newRowSelection[plan.id.toString()] = true;
      });
      setRowSelection(newRowSelection);
    }
  }, [membershipPlansData]);

  const columns = useMemo<ColumnDef<MembershipPlan>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => {
          const membershipPlanId = row.original.id;

          const asociated = membershipPlansAsociated.includes(
            membershipPlanId.toString(),
          );
          return (
            <Checkbox
              checked={row.getIsSelected() || asociated}
              disabled={asociated && mode === 'editar'}
              onCheckedChange={(v) => {
                if (!asociated) row.toggleSelected(!!v);
              }}
              aria-label="Select row"
            />
          );
        },
        enableSorting: false,
        enableHiding: false,
        meta: { className: 'w-[36px] px-3' },
      },
      {
        accessorKey: 'type',
        header: 'Tipo de Plan',
      },
      {
        accessorKey: 'fee',
        header: 'Precio',
        cell: ({ row }) => `S/ ${row.original.fee.toFixed(2)}`,
      },
      {
        accessorKey: 'reservation_limit',
        header: 'Límite',
        accessorFn: (row) =>
          row.reservation_limit == null ? 'Sin límite' : row.reservation_limit,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: membershipPlansData || [],
    columns,
    getRowId: (row) => row.id.toString(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: false,
    enableRowSelection: true,
    debugTable: true,
  });

  if (errorMembershipPlans)
    return <p>Error cargando planes: {errorMembershipPlans.message}</p>;

  return (
    <div className="p-6 h-full font-montserrat">
      <HeaderDescriptor
        title="COMUNIDADES"
        subtitle="AGREGAR PLANES DE MEMBRESÍA"
      />

      <div className="mb-4">
        <Button variant="outline" size="default" onClick={handleCancel}>
          <ChevronLeft className="w-5 h-5" />
          Volver
        </Button>
      </div>

      <div className="mt-0 flex-grow flex flex-col">
        {isLoadingMembershipPlans ? (
          <div className="flex-grow flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
          </div>
        ) : (
          <>
            <DataTableToolbar
              table={table}
              isBulkDeleting={false}
              showBulkDeleteButton={false}
              filterPlaceholder="Buscar plan..."
              showExportButton={false}
              exportFileName="planes-membresía"
              showFilterButton={true}
              onFilterClick={() => {}}
              showSortButton={true}
            />
            <div className="flex-grow">
              <DataTable table={table} columns={columns} />
            </div>
            <DataTablePagination table={table} />
          </>
        )}
      </div>

      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-end pt-4">
        <Button
          variant="outline"
          onClick={handleCancel}
          className="h-10 w-30 text-base"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          className="h-10 w-30 bg-black text-white text-base hover:bg-gray-800"
        >
          Guardar
        </Button>
      </div>
    </div>
  );
}
