import { ColumnDef } from '@tanstack/react-table';
import { Community } from '@/types/community';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash, MoreHorizontal } from 'lucide-react';

interface GetCommunityColumnsProps {
  onDelete: (community: Community) => void;
  onEdit: (community: Community) => void;
}

export function getCommunityColumns({
  onDelete,
  onEdit
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
        const communiy = row.original;
        return (
          <div className="flex items-center justify-center space-x-2">
            <Button
              className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-gray-100 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(communiy);
              }}
            >
              <MoreHorizontal className="!w-5 !h-5" />
            </Button>

            <Button
              className="h-8 w-8 p-0 bg-white text-red-600 border border-red-600 rounded-full flex items-center justify-center hover:bg-red-50 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(communiy);
              }}
              title="Eliminar"
            >
              <Trash className="!w-5 !h-5"/>
            </Button>
          </div>
        );
      },
      meta: { className: 'w-[100px]' },
    },
  ];
}
