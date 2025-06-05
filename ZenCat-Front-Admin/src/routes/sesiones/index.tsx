import { createFileRoute, useNavigate } from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';
import HomeCard from '@/components/common/home-card';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Upload, Calendar, Clock, Users, Activity } from 'lucide-react';
import { useMemo, useState } from 'react';
import { sessionsApi } from '@/api/sessions/sessions';
import { Session, SessionState } from '@/types/session';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SessionsTable } from '@/components/sessions/table';

export const Route = createFileRoute('/sesiones/')({
  component: SesionesComponent,
});

interface CalculatedCounts {
  [SessionState.SCHEDULED]: number;
  [SessionState.ONGOING]: number;
  [SessionState.COMPLETED]: number;
  [SessionState.CANCELLED]: number;
  [SessionState.RESCHEDULED]: number;
  total: number;
}

function SesionesComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);

  const { 
    data: sessionsData,
    isLoading: isLoadingSessions,
    error: errorSessions
  } = useQuery<Session[], Error>({
    queryKey: ['sessions'],
    queryFn: () => sessionsApi.getSessions(),
  });

  const { mutate: deleteSession, isPending: isDeleting } = useMutation<void, Error, string>({
    mutationFn: (id) => sessionsApi.deleteSession(id),
    onSuccess: (_, id) => {
      toast.success('Sesión eliminada', { description: `ID ${id}` });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (err) => {
      toast.error('Error al eliminar', { description: err.message });
    },
  });

  const { mutate: bulkDeleteSessions, isPending: isBulkDeleting } = useMutation({
    mutationFn: (sessions: Session[]) => 
      sessionsApi.bulkDeleteSessions({ sessions: sessions.map(s => s.id) }),
    onSuccess: (_, sessions) => {
      toast.success('Sesiones eliminadas', { description: `${sessions.length} sesiones eliminadas` });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (err) => {
      toast.error('Error al eliminar sesiones', { description: err.message });
    },
  });

  const counts = useMemo<CalculatedCounts | null>(() => {
    if (!sessionsData) return null;

    const calculatedCounts: CalculatedCounts = {
      [SessionState.SCHEDULED]: 0,
      [SessionState.ONGOING]: 0,
      [SessionState.COMPLETED]: 0,
      [SessionState.CANCELLED]: 0,
      [SessionState.RESCHEDULED]: 0,
      total: sessionsData.length,
    };

    sessionsData.forEach(session => {
      if (session.state in calculatedCounts) {
        calculatedCounts[session.state as SessionState]++;
      }
    });

    return calculatedCounts;
  }, [sessionsData]);

  const handleEdit = (session: Session) => {
    navigate({ to: '/sesiones/editar', search: { id: session.id } });
  };

  const handleView = (session: Session) => {
    navigate({ to: '/sesiones/ver', search: { id: session.id } });
  };

  const handleDelete = (session: Session) => {
    setSessionToDelete(session);
    setIsDeleteModalOpen(true);
  };

  const handleBulkDelete = (sessions: Session[]) => {
    bulkDeleteSessions(sessions);
  };

  if (errorSessions) return <p>Error cargando sesiones: {errorSessions.message}</p>;

  return (
    <div className="p-6 h-full flex flex-col">
      <HeaderDescriptor title="SESIONES" subtitle="LISTADO DE SESIONES" />

      <div className="flex items-center justify-center space-x-4 mt-2 font-montserrat min-h-[120px] flex-wrap">
        {counts ? (
          <>
            <HomeCard
              icon={<Calendar className="w-8 h-8 text-blue-600" />}
              iconBgColor="bg-blue-100"
              title="Programadas"
              description={counts[SessionState.SCHEDULED]}
            />
            <HomeCard
              icon={<Activity className="w-8 h-8 text-green-600" />}
              iconBgColor="bg-green-100"
              title="En curso"
              description={counts[SessionState.ONGOING]}
            />
            <HomeCard
              icon={<Clock className="w-8 h-8 text-gray-600" />}
              iconBgColor="bg-gray-100"
              title="Completadas"
              description={counts[SessionState.COMPLETED]}
            />
            <HomeCard
              icon={<Users className="w-8 h-8 text-teal-600" />}
              iconBgColor="bg-teal-100"
              title="Total de sesiones"
              description={counts.total}
            />
          </>
        ) : (
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        )}
      </div>

      <div className="flex justify-end space-x-2 py-4">
        <Button
          onClick={() => navigate({ to: '/sesiones/agregar' })}
          className="h-10 bg-black text-white font-bold hover:bg-gray-800"
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar
        </Button>

        <Button
          size="sm"
          className="h-10 bg-black text-white font-bold hover:bg-gray-800"
          onClick={() => console.log('Carga Masiva clickeada')}
        >
          <Upload className="mr-2 h-4 w-4" /> Carga Masiva
        </Button>
      </div>

      {isLoadingSessions ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
        </div>
      ) : (
        <SessionsTable
          data={sessionsData || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onBulkDelete={handleBulkDelete}
          isBulkDeleting={isBulkDeleting}
        />
      )}

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro que deseas eliminar esta sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
              <div className="mt-2 font-medium">Sesión: {sessionToDelete?.title}</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="space-x-2">
            <AlertDialogCancel onClick={() => setIsDeleteModalOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                className="bg-red-400 text-white flex items-center gap-2 hover:bg-red-500 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-red-200 rounded-lg shadow-sm hover:shadow-md focus:shadow-md transition-all duration-200 ease-in-out"
                onClick={() => {
                  if (sessionToDelete) deleteSession(sessionToDelete.id);
                  setIsDeleteModalOpen(false);
                }}
              >
                Eliminar
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 