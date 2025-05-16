import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/usuarios/editar')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white w-full">
      <div className="p-6 h-full">
        <div className="mb-4">
          <Button
            variant="outline"
            className="flex items-center gap-2 border rounded-lg px-4 py-2 bg-white shadow font-semibold hover:bg-neutral-100"
            onClick={() => navigate({ to: '/usuarios' })}
          >
            <ChevronLeft className="w-5 h-5" />
            Volver
          </Button>
        </div>
        <div className="text-xl font-bold">Editar usuario</div>
        {/* Aquí va el formulario de edición */}
      </div>
    </div>
  );
}
