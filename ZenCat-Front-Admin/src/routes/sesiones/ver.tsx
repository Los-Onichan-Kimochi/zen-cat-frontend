import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { sessionsApi } from '@/api/sessions/sessions';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, Users, MapPin, Link as LinkIcon, User } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SessionState } from '@/types/session';

const sessionSearchSchema = z.object({
  id: z.string(),
});

export const Route = createFileRoute('/sesiones/ver')({
  validateSearch: sessionSearchSchema,
  component: SessionDetailComponent,
});

const getStateColor = (state: SessionState) => {
  switch (state) {
    case SessionState.SCHEDULED:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case SessionState.ONGOING:
      return 'bg-green-100 text-green-800 border-green-200';
    case SessionState.COMPLETED:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case SessionState.CANCELLED:
      return 'bg-red-100 text-red-800 border-red-200';
    case SessionState.RESCHEDULED:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
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

function SessionDetailComponent() {
  const navigate = useNavigate();
  const { id } = Route.useSearch();

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['session', id],
    queryFn: () => sessionsApi.getSessionById(id),
  });

  if (isLoading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="p-6 h-full">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate({ to: '/sesiones' })}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
        <div className="text-center">
          <p className="text-red-600">Error cargando la sesión</p>
        </div>
      </div>
    );
  }

  const isVirtual = !session.local_id;

  return (
    <div className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate({ to: '/sesiones' })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <Button 
          onClick={() => navigate({ to: '/sesiones/editar', search: { id: session.id } })}
          className="bg-black text-white hover:bg-gray-800"
        >
          Editar Sesión
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{session.title}</h1>
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStateColor(session.state)}`}>
                {getStateText(session.state)}
              </div>
            </div>
            <div className={`px-3 py-1 rounded text-sm font-medium ${
              isVirtual ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
            }`}>
              {isVirtual ? 'Virtual' : 'Presencial'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información de fecha y hora */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Información de la Sesión</h3>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-medium">
                    {format(new Date(session.date), 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: es })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Horario</p>
                  <p className="font-medium">
                    {format(new Date(session.start_time), 'HH:mm')} - {format(new Date(session.end_time), 'HH:mm')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Capacidad</p>
                  <p className="font-medium">
                    {session.registered_count} / {session.capacity} participantes
                  </p>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${Math.min((session.registered_count / session.capacity) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Información de ubicación/enlace */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {isVirtual ? 'Información Virtual' : 'Información del Local'}
              </h3>
              
              {isVirtual ? (
                <div className="flex items-start space-x-3">
                  <LinkIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Enlace de la sesión</p>
                    {session.session_link ? (
                      <a 
                        href={session.session_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium break-all"
                      >
                        {session.session_link}
                      </a>
                    ) : (
                      <p className="text-gray-400 italic">No hay enlace disponible</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Local</p>
                    <p className="font-medium">Local ID: {session.local_id}</p>
                    <p className="text-sm text-gray-600">Se mostrará información del local aquí</p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Profesional</p>
                  <p className="font-medium">Profesional ID: {session.professional_id}</p>
                  <p className="text-sm text-gray-600">Se mostrará información del profesional aquí</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 