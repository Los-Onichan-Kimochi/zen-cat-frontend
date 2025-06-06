import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { sessionsApi } from '@/api/sessions/sessions';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const sessionSearchSchema = z.object({
  id: z.string(),
});

export const Route = createFileRoute('/sesiones/editar')({
  validateSearch: sessionSearchSchema,
  component: EditSessionComponent,
});

function EditSessionComponent() {
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

  return (
    <div className="p-6 h-full">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate({ to: '/sesiones' })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Editar Sesión: {session.title}
          </h1>
          
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Formulario para editar sesiones en desarrollo...
            </p>
            <p className="text-gray-400 mt-2">
              Esta funcionalidad se implementará próximamente
            </p>
            <p className="text-sm text-gray-400 mt-4">
              ID de la sesión: {session.id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 