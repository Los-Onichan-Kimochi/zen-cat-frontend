import HeaderDescriptor from '@/components/common/header-descriptor';
import { createFileRoute } from '@tanstack/react-router';
import ReportsDashboard from '@/components/reports/ReportsDashboard';
export const Route = createFileRoute('/reportes')({
  component: ReportesComponent,
});

function ReportesComponent() {
  return (
    <div className="p-2 pt-0 h-full">
      <HeaderDescriptor title="DASHBOARD" subtitle="GENERA TUS REPORTES" />
      <ReportsDashboard />
    </div>
  );
}
