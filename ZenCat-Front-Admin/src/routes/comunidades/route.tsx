import { createFileRoute } from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';
export const Route = createFileRoute('/comunidades')({
  component: ComunidadesComponent,
});

function ComunidadesComponent() {
  return (
    <div className="p-15">
      <HeaderDescriptor title="COMUNIDADES" subtitle="LISTADO DE COMUNIDADES" />
    </div>
  );
} 