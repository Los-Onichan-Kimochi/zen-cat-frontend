import { createFileRoute, useNavigate } from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';
import HomeCard from '@/components/common/home-card';
import { ViewToolbar } from '@/components/common/view-toolbar';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Calendar, Clock, Users, Activity } from 'lucide-react';
import { useMemo, useState } from 'react';
import { sessionsApi } from '@/api/sessions/sessions';
import { convertLimaToUTC } from '@/api/sessions/sessions';
import { Session, SessionState } from '@/types/session';
import { Button } from '@/components/ui/button';
import { BulkCreateDialog } from '@/components/common/bulk-create-dialog';
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
import { getSessionCurrentState } from '@/utils/session-status';
//adicionales
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { professionalsApi } from "@/api/professionals/professionals"; // ajusta el path si es diferente
import { Professional } from "@/types/professional";
import { Label } from '@/components/ui/label';
//fin

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
// Funciones auxiliares – van fuera del componente
function parseExcelDate(input: any): string | null {
  if (!input) return null;

  if (!isNaN(input) && typeof input !== 'string') {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(excelEpoch.getTime() + input * 86400000);
    return date.toISOString().split('T')[0];
  }

  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }

  if (typeof input === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
    const [day, month, year] = input.split('/');
    return `${year}-${month}-${day}`;
  }

  return null;
}

function isValidTime(time: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

function SesionesComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  //adicion -------------------------------------------------------------
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
  const { data: professionals = [] } = useQuery<Professional[]>({
    queryKey: ['professionals'],
    queryFn: professionalsApi.getProfessionals,
  });
  //fin ---------------------------------------------------------------
  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
    error: errorSessions,
  } = useQuery<Session[], Error>({
    queryKey: ['sessions'],
    queryFn: () => sessionsApi.getSessions(),
  });

  // Mock data for reservations - you should replace this with actual API call


  const { mutate: deleteSession, isPending: isDeleting } = useMutation<
    void,
    Error,
    string
  >({
    mutationFn: (id) => sessionsApi.deleteSession(id),
    onSuccess: (_, id) => {
      toast.success('Sesión eliminada', { description: `ID ${id}` });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (err) => {
      toast.error('Error al eliminar', { description: err.message });
    },
  });

  const { mutate: bulkDeleteSessions, isPending: isBulkDeleting } = useMutation(
    {
      mutationFn: (sessions: Session[]) =>
        sessionsApi.bulkDeleteSessions({ sessions: sessions.map((s) => s.id) }),
      onSuccess: (_, sessions) => {
        toast.success('Sesiones eliminadas', {
          description: `${sessions.length} sesiones eliminadas`,
        });
        queryClient.invalidateQueries({ queryKey: ['sessions'] });
      },
      onError: (err) => {
        toast.error('Error al eliminar sesiones', { description: err.message });
      },
    },
  );

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

    sessionsData.forEach((session) => {
      const currentState = getSessionCurrentState({
        start_time: session.start_time,
        end_time: session.end_time,
        state: session.state,
      });

      if (currentState in calculatedCounts) {
        calculatedCounts[currentState]++;
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


  if (errorSessions)
    return <p>Error cargando sesiones: {errorSessions.message}</p>;

  return (
    <div className="p-6 h-full flex flex-col font-montserrat">
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

      <ViewToolbar
        onAddClick={() => navigate({ to: '/sesiones/agregar' })}
        onBulkUploadClick={() => setShowUploadDialog(true)}
        addButtonText="Agregar"
        bulkUploadButtonText="Carga Masiva"
      />

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
            <AlertDialogTitle>
              ¿Estás seguro que deseas eliminar esta sesión?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
              <div className="mt-2 font-medium">
                Sesión: {sessionToDelete?.title}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="space-x-2">
            <AlertDialogCancel onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </AlertDialogCancel>
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

      <>
        <BulkCreateDialog
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
          title="Carga Masiva de Sesiones"
          expectedExcelColumns={[
            'Título',
            'Fecha',
            'Hora de inicio',
            'Hora de fin',
            'Capacidad',
            'Enlace de sesión',
          ]}
          dbFieldNames={[
            'title',
            'date',
            'start_time',
            'end_time',
            'capacity',
            'session_link',
          ]}
          onParsedData={async (data) => {
            if (!selectedProfessionalId) {
              toast.error('Selecciona un profesional antes de cargar.');
              return;
            }

            try {
              const sessions = data.map((item: any, index: number) => {
                const rawDate = item.date;
                let dateString = '';

                // Soporte a Date, string, o número Excel
                if (rawDate instanceof Date) {
                  dateString = rawDate.toISOString().split('T')[0];
                } else if (typeof rawDate === 'number') {
                  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
                  const date = new Date(excelEpoch.getTime() + rawDate * 86400000);
                  dateString = date.toISOString().split('T')[0];
                } else if (typeof rawDate === 'string') {
                  const parts = rawDate.includes('/') ? rawDate.split('/') : rawDate.split('-');
                  if (parts.length === 3) {
                    if (parts[0].length === 4) {
                      dateString = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                    } else {
                      dateString = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                    }
                  } else {
                    throw new Error(`Formato de fecha inválido: ${rawDate}`);
                  }
                } else {
                  throw new Error(`Tipo de dato de fecha no soportado: ${rawDate}`);
                }

                const startTimeStr = String(item.start_time).padStart(5, '0').trim();
                const endTimeStr = String(item.end_time).padStart(5, '0').trim();

                if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(startTimeStr) || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(endTimeStr)) {
                  throw new Error(`Formato de hora inválido en fila ${index + 2}`);
                }

                return {
                  title: item.title,
                  date: convertLimaToUTC(`${dateString}T00:00:00`),
                  start_time: convertLimaToUTC(`${dateString}T${startTimeStr}:00`),
                  end_time: convertLimaToUTC(`${dateString}T${endTimeStr}:00`),
                  capacity: Number(item.capacity),
                  session_link: item.session_link || null,
                  professional_id: selectedProfessionalId,
                };
              });

              await sessionsApi.bulkCreateSessions({ sessions });
              toast.success('Sesiones creadas correctamente');
              queryClient.invalidateQueries({ queryKey: ['sessions'] });
            } catch (err: any) {
              console.error('Detalles del error bulk:', err);
              toast.error('Error al crear sesiones', {
                description: err.message || 'Error bulk creating sessions',
              });
            }
          }}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Selecciona un profesional</label>
            <Select value={selectedProfessionalId || ''} onValueChange={setSelectedProfessionalId}>
              <SelectTrigger>
                <SelectValue placeholder="Profesional" />
              </SelectTrigger>
              <SelectContent>
                {professionals.map((pro) => (
                  <SelectItem key={pro.id} value={pro.id}>
                    {pro.name} {pro.first_last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </BulkCreateDialog>
      </>
    </div>
  );
}
