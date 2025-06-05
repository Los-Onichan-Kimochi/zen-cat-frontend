import { ColumnDef } from '@tanstack/react-table';
import { Community } from '@/types/community';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash, MoreHorizontal } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export function getCommunityColumns({
  onDeleteClick,
}: {
  onDeleteClick: (community: Community) => void;
}): ColumnDef<Community>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
      meta: { className: "w-[36px] px-3" },
    },
    {
      accessorKey: "id",
      header: "Código",
      cell: ({ row }) => {
        const value = row.getValue("id") as string;
        return (
          <div className="max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap" title={value}>
            {value}
          </div>
        );
      },
      meta: { className: "w-[150px]" },
    },
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      accessorKey: "purpose",
      header: "Propósito",
    },
    {
      accessorKey: "number_subscriptions",
      header: "Cantidad de miembros",
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const com = row.original;
        return (
          <div className="flex gap-2 items-center">
            <Link to="/comunidades/ver" search={{ id: com.id }}>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 border border-black rounded-full">
                <MoreHorizontal className="!w-5 !h-5" />
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 border border-black rounded-full hover:bg-red-200"
              onClick={() => onDeleteClick(com)}
            >
              <Trash className="!w-5 !h-5" />
            </Button>
          </div>
        );
      },
      meta: { className: "w-[100px]" },
    },
  ];
}
