import { ColumnDef } from '@tanstack/react-table';
import { Community } from '@/types/community';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash, MoreHorizontal } from 'lucide-react';
import { Link } from '@tanstack/react-router';

interface GetCommunityColumnsProps {
  onDelete: (community: Community) => void;
}

export function getCommunityColumns({
  onDelete,
}: GetCommunityColumnsProps): ColumnDef<Community>[] {
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
      header: () => (
        <div className="text-center font-bold">Código</div>
      ),
      cell: ({ row }) => {
        const value = row.getValue('id') as string;
        return (
          <div
            className="max-w-[100px] overflow-hidden mx-auto text-ellipsis whitespace-nowrap"
            title={value}
          >
            {value}
          </div>
        );
      },
      meta: { className: 'w-[150px]' },
    },
    {
      accessorKey: 'name',
      header: () => (
        <div className="text-center font-bold">Nombre</div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'purpose',
      header: () => (
        <div className="text-center font-bold">Propósito</div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue('purpose')}</div>
      ),
    },
    {
      accessorKey: 'number_subscriptions',
      header: () => (
        <div className="text-center font-bold">Cantidad de miembros</div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue('number_subscriptions')}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => (
        <div className="text-center font-bold">Acciones</div>
      ),
      cell: ({ row }) => {
        const com = row.original;
        return (
          <div className="flex gap-2 items-center justify-center">
            <Link to="/comunidades/ver" search={{ id: com.id }}>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 border border-black rounded-full"
              >
                <MoreHorizontal className="!w-5 !h-5" />
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 border border-black rounded-full hover:bg-red-200"
              onClick={() => onDelete(com)}
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
