import HeaderDescriptor from '@/components/common/header-descriptor';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/planes-membresia')({
  component: PlanesMembresiaComponent,
});

function PlanesMembresiaComponent() {
  return (
    <div className="p-6 h-full">
      <HeaderDescriptor title="PLANES DE MEMBRESÍA" subtitle="LISTADO DE PLANES DE MEMBRESÍA" />
    </div>
  );
} 