import { ColumnDef } from '@tanstack/react-table';
import { MembershipPlan } from '@/types/membership-plan';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash, MoreHorizontal, Eye } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { on } from 'events';

interface GetMembershipPlanColumnsProps {
  onDelete: (membershipPlan: MembershipPlan) => void;
  onView: (membershipPlan: MembershipPlan) => void;
}

export function getMembershipPlanColumns({
  onDelete,
  onView,
}: GetMembershipPlanColumnsProps): ColumnDef<MembershipPlan>[] {
  return [
    {
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
      meta: { className: 'w-[36px] px-3' },
    },
    {
      accessorKey: 'id',
      header: 'Código',
      cell: ({ row }) => {
        const value = row.getValue('id') as string;
        return (
          <div
            className="max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap"
            title={value}
          >
            {value}
          </div>
        );
      },
      meta: { className: 'w-[150px]' },
    },
    {
      accessorKey: 'type',
      header: 'Tipo de Plan',
    },
    {
      accessorKey: 'fee',
      header: 'Precio',
    },
    {
      accessorKey: 'reservation_limit',
      header: 'Límite',
      accessorFn: (row) =>
        row.reservation_limit == null ? 'Sin límite' : row.reservation_limit,
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const membershipPlan = row.original;
        return (
          <div className="flex gap-2 items-center">
            <Button
              className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-gray-100 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onView(membershipPlan);
              }}
            >
              <Eye className="!w-5 !h-5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 border border-black rounded-full hover:bg-red-200"
              onClick={() => onDelete(membershipPlan)}
            >
              <Trash className="!w-5 !h-5" />
            </Button>
          </div>
        );
      },
      meta: { className: 'w-[100px]' },
    },
  ];
}
