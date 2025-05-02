import { createFileRoute } from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';

export const Route = createFileRoute('/profesionales')({
  component: ProfesionalesComponent,
});

function ProfesionalesComponent() {
  return (
    <div className="p-15">
      <HeaderDescriptor title="PROFESIONALES" subtitle="LISTADO DE PROFESIONALES" />
    </div>
  );
} 