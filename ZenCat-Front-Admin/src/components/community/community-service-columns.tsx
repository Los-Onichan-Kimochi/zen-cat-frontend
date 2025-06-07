import { ColumnDef } from '@tanstack/react-table';
import { Service } from '@/types/service';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

export function getCommunityServiceColumns(
  isEditing: boolean,
  onDelete?: (service: Service) => void
): ColumnDef<Service>[] {
  const columns: ColumnDef<Service>[] = [];

  columns.push({
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
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
      accessorKey: 'name',
      header: 'Nombre',
    },
    {
      accessorKey: 'is_virtual',
      header: '¿Es virtual?',
      cell: ({ row }) => (row.original.is_virtual ? 'Sí' : 'No'),
    }
  );

  if (onDelete) {
    columns.push({
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <Button
          type="button"
          disabled={!isEditing}
          className="h-8 w-8 p-0 bg-white text-red-600 border border-red-600 rounded-full flex items-center justify-center hover:bg-red-200 hover:shadow-md transition-all duration-200"
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
