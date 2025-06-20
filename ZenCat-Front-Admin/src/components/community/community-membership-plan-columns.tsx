import { ColumnDef } from '@tanstack/react-table';
import { MembershipPlan } from '@/types/membership-plan';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

export function getCommunityMembershipPlanColumns(
  isEditing: boolean,
  onDelete?: (membershipPlan: MembershipPlan) => void,
): ColumnDef<MembershipPlan>[] {
  const columns: ColumnDef<MembershipPlan>[] = [];

  columns.push({
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { className: 'w-[36px] px-2' },
  });

  columns.push(
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
  );

  if (onDelete) {
    columns.push({
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="ghost"
          type="button"
          disabled={!isEditing}
          className="h-8 w-8 p-0 bg-white text-red-600 border border-red-600 rounded-full flex items-center justify-center hover:bg-black hover:text-white hover:border-black hover:shadow-md transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(row.original);
          }}
        >
          <Trash className="!w-5 !h-5" />
        </Button>
      ),
      meta: { className: 'w-[100px]' },
    });
  }

  return columns;
}
