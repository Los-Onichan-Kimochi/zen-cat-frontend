import { ColumnDef } from '@tanstack/react-table';
import { Local } from '@/types/local';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Trash, Eye, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
interface GetLocalColumnsProps {
  onEdit: (local: Local) => void;
  onDelete: (local: Local) => void;
  onView: (local: Local) => void;
}

export function getLocalColumns({
  onEdit,
  onDelete,
  onView,
}: GetLocalColumnsProps): ColumnDef<Local>[] {
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
      meta: { className: 'w-[36px] px-3' },
    },
    {
      accessorKey: 'id',
      header: () => <div className="text-center font-bold">Código</div>,
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
      accessorKey: 'local_name',
      header: () => (
        <div className="text-center font-bold">Nombre del Local</div>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.getValue('local_name')}
        </div>
      ),
      meta: {
        displayName: 'Nombre del Local',
      },
    },
    {
      id: 'address',
      header: () => <div className="text-center font-bold">Dirección</div>,
      accessorFn: (row) => `${row.street_name} ${row.building_number}`,
      cell: ({ getValue }) => (
        <div className="text-center">{getValue() as string}</div>
      ),
      meta: {
        displayName: 'Dirección',
      },
    },
    {
      accessorKey: 'district',
      header: () => <div className="text-center font-bold">Distrito</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue('district')}</div>
      ),
      meta: {
        displayName: 'Distrito',
      },
    },
    {
      accessorKey: 'province',
      header: () => <div className="text-center font-bold">Provincia</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue('province')}</div>
      ),
      meta: {
        displayName: 'Provincia',
      },
    },
    {
      accessorKey: 'region',
      header: () => <div className="text-center font-bold">Región</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue('region')}</div>
      ),
      meta: {
        displayName: 'Región',
      },
    },
    {
      accessorKey: 'capacity',
      header: () => <div className="text-center font-bold">Capacidad</div>,
      cell: ({ row }) => {
        const capacity = row.getValue('capacity') as number;
        return <div className="text-center">{capacity} personas</div>;
      },
      meta: {
        displayName: 'Capacidad',
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-center font-bold">Acciones</div>,
      cell: ({ row }) => {
        const local = row.original;
        return (
          <div className="flex items-center justify-center space-x-2">
            <Button
              className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-gray-100 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onView(local);
              }}
            >
              <Eye className="!w-5 !h-5" />
            </Button>

            <Button
              className="h-8 w-8 p-0 bg-white text-red-600 border border-red-600 rounded-full flex items-center justify-center hover:bg-red-50 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(local);
              }}
              title="Eliminar"
            >
              <Trash className="!w-5 !h-5" />
            </Button>
          </div>
        );
      },
      enableSorting: false,
      meta: { className: 'w-[100px]' },
    },
  ];
}
/*
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
                    onView(local);
                  }}
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver local
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(local);
                  }}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar local
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
*/