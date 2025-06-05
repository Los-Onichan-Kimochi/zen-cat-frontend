import { ColumnDef } from '@tanstack/react-table';
import { Session, SessionState } from '@/types/session';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Trash, Eye, Calendar, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface GetSessionColumnsProps {
  onEdit: (session: Session) => void;
  onDelete: (session: Session) => void;
  onView: (session: Session) => void;
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
  onView 
}: GetSessionColumnsProps): ColumnDef<Session>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
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
    },
    {
      accessorKey: 'title',
      header: 'Título',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('title')}</div>
      ),
    },
    {
      accessorKey: 'date',
      header: "Fecha",
      cell: ({ row }) => {
        const date = row.getValue('date') as string;
        try {
          return (
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-gray-500" />
              {format(new Date(date), 'dd/MM/yyyy', { locale: es })}
            </div>
          );
        } catch (error) {
          return <div>Fecha inválida</div>;
        }
      },
    },
    {
      id: 'time_range',
      header: 'Horario',
      accessorFn: (row) => `${row.start_time}-${row.end_time}`,
      cell: ({ row }) => {
        const startTime = row.original.start_time;
        const endTime = row.original.end_time;
        try {
          const start = format(new Date(startTime), 'HH:mm');
          const end = format(new Date(endTime), 'HH:mm');
          return (
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-sm">{start} - {end}</span>
            </div>
          );
        } catch (error) {
          return <div>Horario inválido</div>;
        }
      },
    },
    {
      accessorKey: 'state',
      header: "Estado",
      cell: ({ row }) => {
        const state = row.getValue('state') as SessionState;
        return (
          <div className={`px-2 py-1 rounded text-xs font-medium ${getStateColor(state)}`}>
            {getStateText(state)}
          </div>
        );
      },
    },
    {
      id: 'capacity_info',
      header: 'Capacidad',
      accessorFn: (row) => `${row.registered_count}/${row.capacity}`,
      cell: ({ row }) => {
        const registeredCount = row.original.registered_count;
        const capacity = row.original.capacity;
        const percentage = capacity > 0 ? (registeredCount / capacity) * 100 : 0;
        
        return (
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <div className="flex flex-col">
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
    },
    {
      id: 'session_type',
      header: 'Tipo',
      accessorFn: (row) => row.local_id ? 'Presencial' : 'Virtual',
      cell: ({ row }) => {
        const isVirtual = !row.original.local_id;
        return (
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            isVirtual 
              ? 'bg-purple-100 text-purple-800' 
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
        const session = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-blue-100 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onView(session);
              }}
              title="Ver detalles"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-gray-100 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(session);
              }}
              title="Editar"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button
              className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-red-100 hover:shadow-md transition-all duration-200"
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
    },
  ];
} 