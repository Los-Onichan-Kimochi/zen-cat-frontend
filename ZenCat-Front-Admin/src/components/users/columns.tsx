import { ColumnDef } from '@tanstack/react-table';
import { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUpDown, MoreHorizontal, Trash } from 'lucide-react';

interface GetUserColumnsProps {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onViewMemberships: (user: User) => void;
}

export function getUserColumns({ onEdit, onDelete, onViewMemberships }: GetUserColumnsProps): ColumnDef<User>[] {
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
      accessorKey: 'address',
      header: 'Dirección',
      cell: ({ row }) => <div>{row.getValue('address') || '-'}</div>,
    },
    {
      accessorKey: 'district',
      header: 'Distrito',
      cell: ({ row }) => <div>{row.getValue('district') || '-'}</div>,
    },
    {
      accessorKey: 'phone',
      header: 'Teléfono',
      cell: ({ row }) => <div>{row.getValue('phone') || '-'}</div>,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Email <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Rol',
      cell: ({ row }) => {
        const role = row.getValue('role') as string;
        return (
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            role === 'admin' 
              ? 'bg-red-100 text-red-800' 
              : role === 'user'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {role}
          </div>
        );
      },
    },
    {
      id: 'memberships',
      header: 'Membresías',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Button
            className="h-9 px-4 bg-white border border-neutral-300 text-black rounded-lg flex items-center gap-2 shadow-sm hover:bg-black hover:text-white hover:border-black hover:shadow-md transition-all duration-200"
            onClick={() => onViewMemberships(user)}
          >
            Membresías ...
          </Button>
        );
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-gray-100 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(user);
              }}
              title="Editar"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button
              className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-red-100 hover:shadow-md transition-all duration-200"
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
    },
  ];
}
