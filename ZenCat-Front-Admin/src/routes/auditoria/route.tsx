import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { AuditStats } from '@/components/audit/stats';
import { AuditFiltersModal } from '@/components/audit/filters-modal';
import { AuditDetailModal } from '@/components/audit/audit-detail-modal';
import { AuditTable } from '@/components/audit/table';
import { auditoriasApi } from '@/api/auditorias/auditorias';
import { AuditLogFilters, AuditLog } from '@/types/audit';
import { Button } from '@/components/ui/button';
import { useToast } from '@/context/ToastContext';

export const Route = createFileRoute('/auditoria')({
  component: AuditoriaComponent,
});

function AuditoriaComponent() {
  const toast = useToast();
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 25,
  });
  const [tempFilters, setTempFilters] = useState<AuditLogFilters>(filters);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Query para obtener logs de auditoría
  const {
    data: auditData,
    isLoading: isLoadingLogs,
    error: errorLogs,
    refetch: refetchLogs,
    isFetching: isFetchingLogs,
  } = useQuery({
    queryKey: ['auditLogs', filters],
    queryFn: () => auditoriasApi.getAuditLogs(filters),
    refetchOnWindowFocus: false,
  });

  // Query para obtener estadísticas
  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: errorStats,
    refetch: refetchStats,
    isFetching: isFetchingStats,
  } = useQuery({
    queryKey: ['auditStats'],
    queryFn: () => auditoriasApi.getAuditStats(),
    refetchOnWindowFocus: false,
  });

  const handleFiltersChange = (newFilters: AuditLogFilters) => {
    setTempFilters(newFilters);
  };

  const handleApplyFilters = () => {
    setFilters({
      ...tempFilters,
      page: 1, // Reset to first page when filters change
    });
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      page: 1,
      limit: filters.limit,
    };
    setTempFilters(clearedFilters);
    setFilters(clearedFilters);
  };

  const handleOpenFiltersModal = () => {
    setTempFilters(filters); // Sync temp filters with current filters
    setIsFiltersModalOpen(true);
  };

  const handleViewLog = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const handleExportLogs = async () => {
    try {
      // TODO: Implement export functionality
      toast.info('Exportar Logs', {
        description: 'Funcionalidad de exportación en desarrollo',
      });
    } catch (error) {
      toast.error('Error al Exportar', {
        description: 'No se pudieron exportar los logs de auditoría',
      });
    }
  };

  const handleRefresh = async () => {
    const startTime = Date.now();
    
    // Ejecutar ambos refetch en paralelo
    const [logsResult, statsResult] = await Promise.all([
      refetchLogs(),
      refetchStats()
    ]);
    
    // Asegurar que pase al menos 1 segundo
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, 1000 - elapsedTime);
    
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }
    
    return { logsResult, statsResult };
  };

  // Check if there are active filters (excluding page and limit)
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    key !== 'page' && key !== 'limit' && value !== undefined && value !== ''
  );

  if (errorLogs) {
    return (
      <div className="p-6 h-full flex flex-col font-montserrat">
        <HeaderDescriptor title="AUDITORÍA" subtitle="REGISTRO DE ACTIVIDAD DEL SISTEMA" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error cargando logs de auditoría</p>
            <Button onClick={() => refetchLogs()} variant="outline" className="hover:bg-gray-50 transition-colors duration-200">
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-screen flex flex-col font-montserrat overflow-hidden">
      <HeaderDescriptor title="AUDITORÍA" subtitle="REGISTRO DE ACTIVIDAD DEL SISTEMA" />

      {/* Statistics Section */}
      <div className="flex-shrink-0">
        <AuditStats 
          stats={statsData} 
          isLoading={isLoadingStats || isFetchingStats} 
        />
      </div>

      {/* Table Section */}
      <div className="flex-1 flex flex-col min-h-0">
        {isLoadingLogs || isFetchingLogs ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-16 w-16 animate-spin text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500">
                {isLoadingLogs ? 'Cargando logs de auditoría...' : 'Actualizando datos...'}
              </p>
            </div>
          </div>
        ) : (
          <AuditTable
            data={auditData?.logs || []}
            onView={handleViewLog}
            onExport={handleExportLogs}
            onOpenFilters={handleOpenFiltersModal}
            onRefresh={handleRefresh}
            isLoading={isLoadingLogs}
            isRefreshing={isFetchingLogs}
            hasActiveFilters={hasActiveFilters}
          />
        )}
      </div>

      {/* Filters Modal */}
      <AuditFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        filters={tempFilters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        onApplyFilters={handleApplyFilters}
      />

      {/* Detail Modal */}
      <AuditDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedLog(null);
        }}
        auditLog={selectedLog}
      />
    </div>
  );
}

export default AuditoriaComponent;
