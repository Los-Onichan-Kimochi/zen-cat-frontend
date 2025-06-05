import { ColumnDef } from '@tanstack/react-table';
import { Professional } from '@/types/professional';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUpDown, MoreHorizontal, Trash } from 'lucide-react';

interface GetProfessionalColumnsProps {
  onEdit: (professional: Professional) => void;
  onDelete: (professional: Professional) => void;
  onView: (professional: Professional) => void;
}

export function getProfessionalColumns({ 
  onEdit, 
  onDelete, 
  onView 
}: GetProfessionalColumnsProps): ColumnDef<Professional>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Nombres <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue('name')}</div>,
    },
    {
      id: 'lastNames',
      header: 'Apellidos',
      accessorFn: (row) => `${row.first_last_name} ${row.second_last_name || ''}`.trim(),
      cell: ({ getValue }) => <div>{getValue()}</div>,
    },
    {
      accessorKey: 'specialty',
      header: 'Especialidad',
      cell: ({ row }) => <div>{row.getValue('specialty') || '-'}</div>,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Email <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue('email')}</div>,
    },
    {
      accessorKey: 'phone_number',
      header: 'Teléfono',
      cell: ({ row }) => <div>{row.getValue('phone_number') || '-'}</div>,
    },
    {
      accessorKey: 'type',
      header: 'Tipo',
      cell: ({ row }) => <div>{row.getValue('type') || '-'}</div>,
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const professional = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-gray-100 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onView(professional);
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button
              className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-red-100 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(professional);
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
} 