import { createFileRoute } from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';

export const Route = createFileRoute('/locales')({
  component: LocalesComponent,
});

function LocalesComponent() {
  return (
    <div className="p-6 h-full">
      <HeaderDescriptor title="LOCALES" subtitle="LISTADO DE LOCALES" />
    </div>
  );
} 