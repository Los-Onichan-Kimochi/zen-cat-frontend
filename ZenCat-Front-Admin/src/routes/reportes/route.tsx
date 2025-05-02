import HeaderDescriptor from '@/components/common/header-descriptor';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/reportes')({
  component: ReportesComponent,
});

function ReportesComponent() {
  return (
    <div className="p-6 h-full">
      <HeaderDescriptor title="DASHBOARD" subtitle="GENERA TUS REPORTES" />
    </div>
  );
} 