import { createFileRoute } from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';
export const Route = createFileRoute('/membresias')({
  component: MembresiasComponent,
});

function MembresiasComponent() {
  return (
    <div className="p-15">
      <HeaderDescriptor title="MEMBRESÍAS" subtitle="LISTADO DE USUARIOS Y MEMBRESÍAS" />
    </div>
  );
} 