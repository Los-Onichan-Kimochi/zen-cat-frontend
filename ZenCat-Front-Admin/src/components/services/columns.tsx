import { ColumnDef } from '@tanstack/react-table';
import { Service } from '@/types/service';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUpDown, MoreHorizontal, Trash, Eye } from 'lucide-react';

interface GetServiceColumnsProps {
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onView: (service: Service) => void;
}

export function getServiceColumns({ 
  onEdit, 
  onDelete, 
  onView 
}: GetServiceColumnsProps): ColumnDef<Service>[] {
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
          Nombre <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'description',
      header: 'Descripción',
      cell: ({ row }) => {
        const description = row.getValue('description') as string;
        const truncated = description && description.length > 50 
          ? `${description.substring(0, 50)}...` 
          : description || '-';
        return <div title={description}>{truncated}</div>;
      },
    },
    {
      accessorKey: 'is_virtual',
      header: 'Tipo',
      cell: ({ row }) => {
        const isVirtual = row.getValue('is_virtual') as boolean;
        return (
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            isVirtual 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {isVirtual ? 'Virtual' : 'Presencial'}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const service = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-blue-100 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onView(service);
              }}
              title="Ver detalles"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-gray-100 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(service);
              }}
              title="Editar"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button
              className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-red-100 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(service);
              }}
              title="Eliminar"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
} 