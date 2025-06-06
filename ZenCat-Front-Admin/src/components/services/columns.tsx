import { ColumnDef } from '@tanstack/react-table';
import { Service } from '@/types/service';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Trash, Eye, Edit, ArrowUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface GetServiceColumnsProps {
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onView: (service: Service) => void;
}

export function getServiceColumns({
  onEdit,
  onDelete,
  onView,
}: GetServiceColumnsProps): ColumnDef<Service>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <div className="text-center font-bold">Nombre</div>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium">{row.getValue('name')}</div>
      ),
      meta: {
        displayName: 'Nombre',
      },
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <div className="text-center font-bold">Descripción</div>
      ),
      cell: ({ row }) => {
        const description = row.getValue('description') as string;
        const truncated =
          description && description.length > 50
            ? `${description.substring(0, 50)}...`
            : description || '-';
        return (
          <div className="text-center" title={description}>
            {truncated}
          </div>
        );
      },
      meta: {
        displayName: 'Descripción',
      },
    },
    {
      accessorKey: 'is_virtual',
      header: ({ column }) => <div className="text-center font-bold">Tipo</div>,
      cell: ({ row }) => {
        const isVirtual = row.getValue('is_virtual') as boolean;
        return (
          <div className="flex justify-center">
            <div
              className={`px-2 py-1 rounded text-xs font-medium ${
                isVirtual
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {isVirtual ? 'Virtual' : 'Presencial'}
            </div>
          </div>
        );
      },
      meta: {
        displayName: 'Tipo',
      },
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <div className="text-center font-bold">Acciones</div>
      ),
      cell: ({ row }) => {
        const service = row.original;
        return (
          <div className="flex items-center justify-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-gray-100 hover:shadow-md transition-all duration-200"
                  title="Más opciones"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(service);
                  }}
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver servicio
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(service);
                  }}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar servicio
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              className="h-8 w-8 p-0 bg-white text-red-600 border border-red-600 rounded-full flex items-center justify-center hover:bg-red-50 hover:shadow-md transition-all duration-200"
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
      enableSorting: false,
      meta: {
        displayName: 'Acciones',
      },
    },
  ];
}
