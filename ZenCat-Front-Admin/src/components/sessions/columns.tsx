import { ColumnDef } from '@tanstack/react-table';
import { Session, SessionState } from '@/types/session';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Trash, Eye, Edit, Calendar, Clock, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface GetSessionColumnsProps {
  onEdit: (session: Session) => void;
  onDelete: (session: Session) => void;
  onView: (session: Session) => void;
  onViewReservations?: (session: Session) => void;
}

const getStateColor = (state: SessionState) => {
  switch (state) {
    case SessionState.SCHEDULED:
      return 'bg-blue-100 text-blue-800';
    case SessionState.ONGOING:
      return 'bg-green-100 text-green-800';
    case SessionState.COMPLETED:
      return 'bg-gray-100 text-gray-800';
    case SessionState.CANCELLED:
      return 'bg-red-100 text-red-800';
    case SessionState.RESCHEDULED:
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStateText = (state: SessionState) => {
  switch (state) {
    case SessionState.SCHEDULED:
      return 'Programada';
    case SessionState.ONGOING:
      return 'En curso';
    case SessionState.COMPLETED:
      return 'Completada';
    case SessionState.CANCELLED:
      return 'Cancelada';
    case SessionState.RESCHEDULED:
      return 'Reprogramada';
    default:
      return state;
  }
};

export function getSessionColumns({ 
  onEdit, 
  onDelete, 
  onView,
  onViewReservations
}: GetSessionColumnsProps): ColumnDef<Session>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
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
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <div className="text-center font-bold">Título</div>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium">{row.getValue('title')}</div>
      ),
      meta: {
        displayName: 'Título'
      }
    },
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <div className="text-center font-bold">Fecha</div>
      ),
      cell: ({ row }) => {
        const date = row.getValue('date') as string;
        try {
          return (
            <div className="flex items-center justify-center">
              <Calendar className="mr-2 h-4 w-4 text-gray-500" />
              {format(new Date(date), 'dd/MM/yyyy', { locale: es })}
            </div>
          );
        } catch (error) {
          return <div className="text-center">Fecha inválida</div>;
        }
      },
      meta: {
        displayName: 'Fecha'
      }
    },
    {
      id: 'time_range',
      header: ({ column }) => (
        <div className="text-center font-bold">Horario</div>
      ),
      accessorFn: (row) => `${row.start_time}-${row.end_time}`,
      cell: ({ row }) => {
        const startTime = row.original.start_time;
        const endTime = row.original.end_time;
        try {
          const start = format(new Date(startTime), 'HH:mm');
          const end = format(new Date(endTime), 'HH:mm');
          return (
            <div className="flex items-center justify-center">
              <Clock className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-sm">{start} - {end}</span>
            </div>
          );
        } catch (error) {
          return <div className="text-center">Horario inválido</div>;
        }
      },
      meta: {
        displayName: 'Horario'
      }
    },
    {
      accessorKey: 'state',
      header: ({ column }) => (
        <div className="text-center font-bold">Estado</div>
      ),
      cell: ({ row }) => {
        const state = row.getValue('state') as SessionState;
        return (
          <div className="flex justify-center">
            <div className={`px-2 py-1 rounded text-xs font-medium ${getStateColor(state)}`}>
              {getStateText(state)}
            </div>
          </div>
        );
      },
      meta: {
        displayName: 'Estado'
      }
    },
    {
      id: 'capacity_info',
      header: ({ column }) => (
        <div className="text-center font-bold">Capacidad</div>
      ),
      accessorFn: (row) => `${row.registered_count}/${row.capacity}`,
      cell: ({ row }) => {
        const registeredCount = row.original.registered_count;
        const capacity = row.original.capacity;
        const percentage = capacity > 0 ? (registeredCount / capacity) * 100 : 0;
        
        return (
          <div className="flex items-center justify-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium">
                {registeredCount}/{capacity}
              </span>
              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${
                    percentage >= 90 ? 'bg-red-400' :
                    percentage >= 70 ? 'bg-yellow-400' :
                    'bg-green-400'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        );
      },
      meta: {
        displayName: 'Capacidad'
      }
    },
    {
      id: 'view_reservations',
      header: ({ column }) => (
        <div className="text-center font-bold">Ver reservas</div>
      ),
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="flex justify-center">
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 bg-black text-white hover:bg-gray-800 font-medium"
              onClick={(e) => {
                e.stopPropagation();
                onViewReservations?.(session);
              }}
            >
              Ver reservas
            </Button>
          </div>
        );
      },
      enableSorting: false,
      meta: {
        displayName: 'Ver reservas'
      }
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <div className="text-center font-bold">Acciones</div>
      ),
      cell: ({ row }) => {
        const session = row.original;
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
                    onView(session);
                  }}
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver sesión
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(session);
                  }}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              className="h-8 w-8 p-0 bg-white text-red-600 border border-red-600 rounded-full flex items-center justify-center hover:bg-red-50 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(session);
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