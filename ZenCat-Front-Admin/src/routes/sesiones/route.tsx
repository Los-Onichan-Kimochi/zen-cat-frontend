import { createFileRoute } from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';

export const Route = createFileRoute('/sesiones')({
  component: SesionesComponent,
});

function SesionesComponent() {
  return (
    <div className="p-15">
      <HeaderDescriptor title="SESIONES" subtitle="LISTADO DE SESIONES" />
    </div>
  );
} 