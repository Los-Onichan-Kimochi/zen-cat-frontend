import { createFileRoute, useNavigate } from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';
import HomeCard from '@/components/common/home-card';
import { ViewToolbar } from '@/components/common/view-toolbar';

import { useToast } from '@/context/ToastContext';
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { professionalsApi } from '@/api/professionals/professionals'; // ajusta el path si es diferente
import { Professional } from '@/types/professional';
import { Label } from '@/components/ui/label';
//fin
//nuevos para locales
import { localsApi } from '@/api/locals/locals'; // ajusta el path si es diferente
import { Local } from '@/types/local';

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
  const toast = useToast();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  //
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  //adicion -------------------------------------------------------------
  // adaprtar para limpiar seleccion
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<
    string | undefined
  >();
  const [uploadMode, setUploadMode] = useState<'virtual' | 'presencial'>('virtual');

  const { data: professionals = [] } = useQuery<Professional[]>({
    queryKey: ['professionals'],
    queryFn: professionalsApi.getProfessionals,
  });
  //fin ---------------------------------------------------------------
  //para seleccion de locales
  //const [selectedLocalId, setSelectedLocalId] = useState<string | undefined>();
  const [selectedLocal, setSelectedLocal] = useState<Local | null>(null);
  const { data: locals = [] } = useQuery<Local[]>({
    queryKey: ['locals'],
    queryFn: localsApi.getLocals,
  });
  //const [selectedLocalCapacity, setSelectedLocalCapacity] = useState<number>(0);

  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
    error: errorSessions,
    refetch: refetchSessions,
    isFetching: isFetchingSessions,
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
      toast.success('Sesión Eliminada', {
        description: 'La sesión ha sido eliminada exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (err) => {
      toast.error('Error al Eliminar', {
        description: err.message || 'No se pudo eliminar la sesión.',
      });
    },
  });

  const { mutate: bulkDeleteSessions, isPending: isBulkDeleting } = useMutation(
    {
      mutationFn: (sessions: Session[]) =>
        sessionsApi.bulkDeleteSessions({ sessions: sessions.map((s) => s.id) }),
      onSuccess: (_, sessions) => {
        toast.success('Sesiones Eliminadas', {
          description: `${sessions.length} sesiones eliminadas exitosamente.`,
        });
        queryClient.invalidateQueries({ queryKey: ['sessions'] });
      },
      onError: (err) => {
        toast.error('Error al Eliminar Sesiones', {
          description: err.message || 'No se pudieron eliminar las sesiones.',
        });
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

  const handleRefresh = async () => {
    const startTime = Date.now();

    const [sessionsResult, countsResult] = await Promise.all([
      refetchSessions(),
      refetchCounts(),
    ]);

    // Asegurar que pase al menos 1 segundo
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, 1000 - elapsedTime);

    if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }

    return { sessionsResult, countsResult };
  };

  const handleBulkDelete = (sessions: Session[]) => {
    bulkDeleteSessions(sessions);
  };

  if (errorSessions)
    return <p>Error cargando sesiones: {errorSessions.message}</p>;

  return (
    <div className="p-6 h-screen flex flex-col font-montserrat overflow-hidden">
      <HeaderDescriptor title="SESIONES" subtitle="LISTADO DE SESIONES" />

      {/* Statistics Section */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center space-x-4 mt-2 font-montserrat min-h-[120px] flex-wrap">
          {counts ? (
            <>
              <HomeCard
                icon={<Calendar className="w-8 h-8 text-blue-600" />}
                iconBgColor="bg-blue-100"
                title="Programadas"
                description={counts[SessionState.SCHEDULED]}
                descColor="text-blue-600"
                isLoading={isFetchingSessions}
              />
              <HomeCard
                icon={<Activity className="w-8 h-8 text-green-600" />}
                iconBgColor="bg-green-100"
                title="En curso"
                description={counts[SessionState.ONGOING]}
                descColor="text-green-600"
                isLoading={isFetchingSessions}
              />
              <HomeCard
                icon={<Clock className="w-8 h-8 text-gray-600" />}
                iconBgColor="bg-gray-100"
                title="Completadas"
                description={counts[SessionState.COMPLETED]}
                descColor="text-gray-600"
                isLoading={isFetchingSessions}
              />
              <HomeCard
                icon={<Users className="w-8 h-8 text-teal-600" />}
                iconBgColor="bg-teal-100"
                title="Total de sesiones"
                description={counts.total}
                descColor="text-teal-600"
                isLoading={isFetchingSessions}
              />
            </>
          ) : (
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          )}
        </div>

        <ViewToolbar
          onAddClick={() => navigate({ to: '/sesiones/agregar' })}
          onBulkUploadClick={() => {
            setUploadMode('virtual');
            setShowUploadDialog(true);
          }}// Activa el diálogo carga masiva
          addButtonText="Agregar"
          bulkUploadButtonText="Carga Masiva"
        />
      </div>

      {/* Table Section */}
      <div className="flex-1 flex flex-col min-h-0">
        {isLoadingSessions ? (
          <div className="flex-1 flex items-center justify-center">
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
            onRefresh={handleRefresh}
            isRefreshing={isFetchingSessions}
          />
        )}
      </div>

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
          onOpenChange={(open) => {
            setShowUploadDialog(open);
            if (!open) {
              setSelectedProfessionalId(undefined); // Limpia profesional al cerrar
              setSelectedLocal(null);
            }
          }}
          mode={uploadMode}
          selectedLocalCapacity={Number(selectedLocal?.capacity) || Infinity}
          module="sessions" // Activa validaciones especiales
          expectedExcelColumns={
            uploadMode === 'virtual'
              ? ['Título', 'Fecha', 'Hora de inicio', 'Hora de fin', 'Capacidad', 'Enlace de sesión']
              : ['Título', 'Fecha', 'Hora de inicio', 'Hora de fin', 'Capacidad']
          }
          dbFieldNames={
            uploadMode === 'virtual'
              ? ['title', 'date', 'start_time', 'end_time', 'capacity', 'session_link']
              : ['title', 'date', 'start_time', 'end_time', 'capacity']
          }
          existingSessions={
            sessionsData?.filter((s) =>
              uploadMode === 'virtual'
                ? s.professional_id === selectedProfessionalId
                : s.local_id === selectedLocal?.id
            ) || []
          }
          canContinue={() => {
            if (uploadMode === 'virtual' && !selectedProfessionalId)
              return 'Selecciona un profesional antes de cargar.';
            if (uploadMode === 'presencial' && !selectedLocal)
              return 'Selecciona un local antes de cargar.';
            return true;
          }}
          title="Carga Masiva de Sesiones"



          onParsedData={async (data, setError) => {
            if (uploadMode === 'virtual' && !selectedProfessionalId) {
              setError?.('Selecciona un profesional antes de cargar.');
              return false;
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
                  const date = new Date(
                    excelEpoch.getTime() + rawDate * 86400000,
                  );
                  dateString = date.toISOString().split('T')[0];
                } else if (typeof rawDate === 'string') {
                  const parts = rawDate.includes('/')
                    ? rawDate.split('/')
                    : rawDate.split('-');
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
                  throw new Error(
                    `Tipo de dato de fecha no soportado: ${rawDate}`,
                  );
                }
                function normalizeTime(value: any): string {
                  if (value instanceof Date) {
                    return value.toTimeString().slice(0, 5); // "HH:MM"
                  } else if (typeof value === 'number') {
                    const totalMinutes = Math.round(value * 24 * 60);
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;
                    return `${hours.toString().padStart(2, '0')}:${minutes
                      .toString()
                      .padStart(2, '0')}`;
                  } else if (typeof value === 'string') {
                    return value.slice(0, 5);
                  }
                  return '';
                }
                const startTimeStr = normalizeTime(item.start_time);
                const endTimeStr = normalizeTime(item.end_time);

                const fullStart = `${dateString}T${startTimeStr}:00`;
                const fullEnd = `${dateString}T${endTimeStr}:00`;

                if (
                  !/^([01]\d|2[0-3]):([0-5]\d)$/.test(startTimeStr) ||
                  !/^([01]\d|2[0-3]):([0-5]\d)$/.test(endTimeStr)
                ) {
                  throw new Error(
                    `Formato de hora inválido en fila ${index + 2}`,
                  );
                }

                return {
                  title: item.title,
                  date: new Date(`${dateString}T00:00:00-05:00`).toISOString(),
                  start_time: new Date(`${dateString}T${startTimeStr}:00-05:00`).toISOString(),
                  end_time: new Date(`${dateString}T${endTimeStr}:00-05:00`).toISOString(),
                  capacity: Number(item.capacity),
                  session_link: item.session_link || null,
                  professional_id: uploadMode === 'virtual' ? selectedProfessionalId : '00ca3624-2fee-4aea-bd30-7ff3e30c2701',
                  local_id: uploadMode === 'presencial' ? selectedLocal?.id : null,
                };
              });

              await sessionsApi.bulkCreateSessions({ sessions });
              toast.success('Sesiones creadas correctamente');
              queryClient.invalidateQueries({ queryKey: ['sessions'] });
              //setShowUploadDialog(false); // cerrar solo si todo está bien OJOOOOOOOOOOOOOOOO
              //onOpenChange(false); // solo cerrar si todo va bien
              //   El modal se cerrará automáticamente desde BulkCreateDialog
              setShowUploadDialog(false); // SOLO acá debes cerrar SI ESTA TODO CORRECTO
              return true;
            } catch (err: any) {
              //console.error('Detalles del error bulk:', err);
              //toast.error('Error al crear sesiones', {
              //description: err.message || 'Error bulk creating sessions',
              //});
              //setError(err.message || 'Ocurrió un error inesperado al crear las sesiones.');
              //comentar:
              await sessionsApi.bulkCreateSessions(data);
              if (err.response?.status === 409) {
                const message = err.response.data?.message || 'Conflicto: sesión duplicada.';
                setError?.(`Error 409: ${message}`);
              } else {
                setError?.('Ocurrió un error inesperado al crear las sesiones.');
              }
              //const mensaje =
                //err?.response?.data?.message || err.message || 'Ocurrió un error inesperado al crear las sesiones.';

              //setError?.(error ? `${error}\n${mensaje}` : mensaje);
              // NO CIERRES EL MODAL
              //return false;
            }
          }}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Modalidad</label>
            <Select value={uploadMode} onValueChange={(value) => setUploadMode(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Modalidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="presencial">Presencial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {uploadMode === 'virtual' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Selecciona un profesional</label>
              <Select
                value={selectedProfessionalId || ''}
                onValueChange={setSelectedProfessionalId}
              >
                <SelectTrigger><SelectValue placeholder="Profesional" /></SelectTrigger>
                <SelectContent>
                  {professionals.map((pro) => (
                    <SelectItem key={pro.id} value={pro.id}>
                      {pro.name} {pro.first_last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {uploadMode === 'presencial' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Selecciona un local</label>
              <Select
                value={selectedLocal?.id || ''}
                onValueChange={(value) => {
                  const local = locals.find((l) => l.id === value);
                  setSelectedLocal(local || null);
                }}
              >
                <SelectTrigger><SelectValue placeholder="Local" /></SelectTrigger>
                <SelectContent>
                  {locals.map((local) => (
                    <SelectItem key={local.id} value={local.id}>
                      {local.local_name} - Capacidad: {local.capacity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="px-1 pt-1 text-sm text-muted-foreground space-y-1">
            <p>
              El archivo debe contener las siguientes columnas (en este orden):
              <br />
              <strong>
                {uploadMode === 'virtual' ? (
                  <>Título, Fecha, Hora de inicio, Hora de fin, Capacidad, Enlace de sesión</>
                ) : (
                  <>Título, Fecha, Hora de inicio, Hora de fin, Capacidad</>
                )}
              </strong>
            </p>
            <a
              href={
                uploadMode === 'virtual'
                  ? '/plantillas/plantilla-carga-sesiones.xlsx'
                  : '/plantillas/plantilla-carga-sesiones-presencial.xlsx'
              }
              className="text-blue-600 hover:underline"
              download
            >
              Descargar plantilla de ejemplo
            </a>
          </div>
        </BulkCreateDialog>
      </>
    </div>
  );
}
