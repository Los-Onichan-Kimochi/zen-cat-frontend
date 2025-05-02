import HeaderDescriptor from '@/components/common/header-descriptor';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/log-errores')({
  component: LogErroresComponent,
});

function LogErroresComponent() {
  return (
    <div className="p-6 h-full">
      <HeaderDescriptor title="LOG DE ERRORES" subtitle="LISTADO DE ERRORES" />
    </div>
  );
} 