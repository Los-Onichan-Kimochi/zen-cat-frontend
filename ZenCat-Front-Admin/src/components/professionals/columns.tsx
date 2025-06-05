import { ColumnDef } from '@tanstack/react-table';
import { Professional } from '@/types/professional';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Trash, Eye, Edit, ArrowUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
        <div className="flex justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
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
        displayName: 'Nombres'
      }
    },
    {
      id: 'lastNames',
      header: ({ column }) => (
        <div className="text-center font-bold">Apellidos</div>
      ),
      accessorFn: (row) => `${row.first_last_name} ${row.second_last_name || ''}`.trim(),
      cell: ({ getValue }) => (
        <div className="text-center">{getValue()}</div>
      ),
      meta: {
        displayName: 'Apellidos'
      }
    },
    {
      accessorKey: 'specialty',
      header: ({ column }) => (
        <div className="text-center font-bold">Especialidad</div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue('specialty') || '-'}</div>
      ),
      meta: {
        displayName: 'Especialidad'
      }
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
        displayName: 'Correo electrónico'
      }
    },
    {
      accessorKey: 'phone_number',
      header: ({ column }) => (
        <div className="text-center font-bold">Número de celular</div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue('phone_number') || '-'}</div>
      ),
      meta: {
        displayName: 'Número de celular'
      }
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <div className="text-center font-bold">Tipo</div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue('type') || '-'}</div>
      ),
      meta: {
        displayName: 'Tipo'
      }
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <div className="text-center font-bold">Acciones</div>
      ),
      cell: ({ row }) => {
        const professional = row.original;
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
                    onView(professional);
                  }}
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver profesional
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(professional);
                  }}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar profesional
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              className="h-8 w-8 p-0 bg-white text-red-600 border border-red-600 rounded-full flex items-center justify-center hover:bg-red-50 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(professional);
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
        displayName: 'Acciones'
      }
    },
  ];
} 