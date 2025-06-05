import { ColumnDef } from '@tanstack/react-table';
import { Service } from '@/types/service';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

export function getCommunityServiceColumns(
  onDeleteClick: (service: Service) => void
): ColumnDef<Service>[] {
  return [
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
    },
    {
      accessorKey: 'name',
      header: 'Nombre',
    },
    {
      accessorKey: 'is_virtual',
      header: '¿Es virtual?',
      cell: ({ row }) => (row.original.is_virtual ? 'Sí' : 'No'),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 border border-black rounded-full hover:bg-red-200"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick(row.original);
          }}
        >
          <Trash className="w-5 h-5" />
        </Button>
      ),
      meta: { className: 'w-[100px]' },
    },
  ];
}
