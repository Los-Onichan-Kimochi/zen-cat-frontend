import { createFileRoute } from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';

export const Route = createFileRoute('/auditoria')({
  component: AuditoriaComponent,
});

function AuditoriaComponent() {
  return (
    <div className="p-6 h-full">
      <HeaderDescriptor title="AUDITORÍA" subtitle="LISTADO DE AUDITORÍA" />
    </div>
  );
} 