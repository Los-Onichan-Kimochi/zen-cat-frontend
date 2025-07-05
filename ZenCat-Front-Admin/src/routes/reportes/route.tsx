import HeaderDescriptor from '@/components/common/header-descriptor';
import { createFileRoute } from '@tanstack/react-router';
import ReportsDashboard from '@/components/reports/ReportsDashboard';
import CommunityReportsDashboard from '@/components/reports/CommunityReportsDashboard';
import { useState } from 'react';

export const Route = createFileRoute('/reportes')({
  component: ReportesComponent,
});

function ReportesComponent() {
  const [activeReport, setActiveReport] = useState<'services' | 'communities'>(
    'services',
  );

  return (
    <div className="p-2 pt-0 h-full">
      <HeaderDescriptor title="DASHBOARD" subtitle="GENERA TUS REPORTES" />

      {/* Selector de reportes */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveReport('services')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeReport === 'services'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Reporte de Servicios
          </button>
          <button
            onClick={() => setActiveReport('communities')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeReport === 'communities'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Reporte de Comunidades
          </button>
        </div>
      </div>

      {/* Contenido del reporte activo */}
      {activeReport === 'services' ? (
        <ReportsDashboard />
      ) : (
        <CommunityReportsDashboard />
      )}
    </div>
  );
}
