import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { sessionsApi } from '@/api/sessions/sessions';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { localsApi } from '@/api/locals/locals';

const localSearchSchema = z.object({
  id: z.string(),
});

export const Route = createFileRoute('/locales/editar')({
  validateSearch: localSearchSchema,
  component: EditLocalComponent,
});

function EditLocalComponent(){
  const navigate = useNavigate();
  const { id } = Route.useSearch();
    const {
    data: local,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['local', id],
    queryFn: () => localsApi.getLocalById(id),
  });
  return (
    <div className="p-6 h-full">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={() => navigate({ to: '/locales' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      
      </div>
    </div>
  )
}