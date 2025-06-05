import { ColumnDef } from '@tanstack/react-table';
import { User } from '@/types/user';
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

interface GetUserColumnsProps {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onViewMemberships: (user: User) => void;
  onView?: (user: User) => void;
}

export function getUserColumns({
  onEdit,
  onDelete,
  onViewMemberships,
  onView,
}: GetUserColumnsProps): ColumnDef<User>[] {
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
        <div className="text-center font-bold">Nombres</div>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium">{row.getValue('name')}</div>
      ),
      meta: {
        displayName: 'Nombres',
      },
    },
    {
      accessorKey: 'address',
      header: ({ column }) => (
        <div className="text-center font-bold">Dirección</div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue('address') || '-'}</div>
      ),
      meta: {
        displayName: 'Dirección',
      },
    },
    {
      accessorKey: 'district',
      header: ({ column }) => (
        <div className="text-center font-bold">Distrito</div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue('district') || '-'}</div>
      ),
      meta: {
        displayName: 'Distrito',
      },
    },
    {
      accessorKey: 'phone',
      header: ({ column }) => (
        <div className="text-center font-bold">Teléfono</div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue('phone') || '-'}</div>
      ),
      meta: {
        displayName: 'Teléfono',
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <div className="text-center font-bold">Correo electrónico</div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue('email')}</div>
      ),
      meta: {
        displayName: 'Correo electrónico',
      },
    },
    {
      accessorKey: 'role',
      header: ({ column }) => <div className="text-center font-bold">Rol</div>,
      cell: ({ row }) => {
        const role = row.getValue('role') as string;
        return (
          <div className="flex justify-center">
            <div
              className={`px-2 py-1 rounded text-xs font-medium ${
                role === 'admin'
                  ? 'bg-red-100 text-red-800'
                  : role === 'user'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
              }`}
            >
              {role}
            </div>
          </div>
        );
      },
      meta: {
        displayName: 'Rol',
      },
    },
    {
      id: 'memberships',
      header: ({ column }) => (
        <div className="text-center font-bold">Membresías</div>
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex justify-center">
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 bg-black text-white hover:bg-gray-800 font-medium"
              onClick={() => onViewMemberships(user)}
            >
              Ver membresías
            </Button>
          </div>
        );
      },
      enableSorting: false,
      meta: {
        displayName: 'Membresías',
      },
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <div className="text-center font-bold">Acciones</div>
      ),
      cell: ({ row }) => {
        const user = row.original;
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
                {onView && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(user);
                    }}
                    className="cursor-pointer"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver usuario
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(user);
                  }}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar usuario
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              className="h-8 w-8 p-0 bg-white text-red-600 border border-red-600 rounded-full flex items-center justify-center hover:bg-red-50 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(user);
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
