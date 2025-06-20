import React, { useState, useCallback, useMemo } from 'react';
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

  // Memoizar si hay filtros activos para evitar recálculos
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => 
      key !== 'page' && key !== 'limit' && value !== undefined && value !== ''
    );
  }, [filters]);

  const handleFiltersChange = useCallback((newFilters: AuditLogFilters) => {
    setFilters({
      ...newFilters,
      page: 1, // Reset to first page when filters change
    });
  }, []);

  const handleApplyFilters = useCallback(() => {
    // This will be called by the modal after updating filters
    setIsFiltersModalOpen(false);
  }, []);

  const handleClearFilters = useCallback(() => {
    const clearedFilters = {
      page: 1,
      limit: filters.limit,
    };
    setFilters(clearedFilters);
  }, [filters.limit]);

  const handleOpenFiltersModal = useCallback(() => {
    // Close detail modal if open to prevent focus conflicts
    if (isDetailModalOpen) {
      setIsDetailModalOpen(false);
      setSelectedLog(null);
    }
    setIsFiltersModalOpen(true);
  }, [isDetailModalOpen]);

  const handleViewLog = useCallback((log: AuditLog) => {
    // Close filters modal if open to prevent focus conflicts
    if (isFiltersModalOpen) {
      setIsFiltersModalOpen(false);
    }
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  }, [isFiltersModalOpen]);

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedLog(null);
  }, []);

  const handleRefresh = useCallback(async () => {
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
  }, [refetchLogs, refetchStats]);

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
            onExport={undefined}
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
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        onApplyFilters={handleApplyFilters}
      />

      {/* Detail Modal */}
      <AuditDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        auditLog={selectedLog}
      />
    </div>
  );
}

export default AuditoriaComponent;
