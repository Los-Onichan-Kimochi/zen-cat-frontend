import HeaderDescriptor from '@/components/common/header-descriptor';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/servicios')({
  component: ServiciosComponent,
});

function ServiciosComponent() {
  return (
    <div className="p-6 h-full">
      <HeaderDescriptor title="SERVICIOS" subtitle="LISTADO DE SERVICIOS" />
    </div>
  );
} 