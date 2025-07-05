import { ColumnDef } from '@tanstack/react-table';
import { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Trash, IdCard } from 'lucide-react';

interface GetUsersColumnsProps {
  onView: (user: User) => void;
  onDelete: (user: User) => void;
  onViewMemberships: (user: User) => void;
}

export const getUsersColumns = ({
  onView,
  onDelete,
  onViewMemberships,
}: GetUsersColumnsProps): ColumnDef<User>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { className: 'w-[36px] px-3' },
  },
  {
    accessorKey: 'name',
    header: () => <div className="text-center font-bold">Usuario</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.name || 'N/A'}</div>
    ),
  },
  {
    accessorKey: 'onboarding.phoneNumber',
    header: () => <div className="text-center font-bold">Celular</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.onboarding?.phoneNumber || 'N/A'}
      </div>
    ),
  },
  {
    accessorKey: 'onboarding.documentNumber',
    header: () => <div className="text-center font-bold">Documento</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.onboarding?.documentNumber || 'N/A'}
      </div>
    ),
  },
  {
    accessorKey: 'onboarding.district',
    header: () => <div className="text-center font-bold">Distrito</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.onboarding?.district || 'N/A'}
      </div>
    ),
  },
  {
    id: 'memberships',
    header: () => <div className="text-center font-bold">Membresías</div>,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center justify-center">
          <Button
            className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all duration-200 hover:shadow-sm active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              onViewMemberships(user);
            }}
            title="Ver Membresías"
          >
            <IdCard className="!w-5 !h-5" />
          </Button>
        </div>
      );
    },
    enableSorting: false,
    meta: { className: 'w-[100px]' },
  },
  {
    id: 'actions',
    header: () => <div className="text-center font-bold">Acciones</div>,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center justify-center space-x-2">
          <Button
            className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all duration-200 hover:shadow-sm active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              onView(user);
            }}
          >
            <Eye className="!w-5 !h-5" />
          </Button>

          <Button
            className="h-8 w-8 p-0 bg-white text-red-600 border border-red-600 rounded-full flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all duration-200 hover:shadow-sm active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(user);
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
