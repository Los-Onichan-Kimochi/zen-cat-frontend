import React, { useState, useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { ErrorStats } from '@/components/error-log/stats';
import { ErrorLogFiltersModal } from '@/components/error-log/filters-modal';
import { ErrorDetailModal } from '@/components/error-log/error-detail-modal';
import { ErrorTable } from '@/components/error-log/table';
import { errorLogApi } from '@/api/error-log/error-log';
import { AuditLogFilters, AuditLog } from '@/types/audit';
import { Button } from '@/components/ui/button';
import { useToast } from '@/context/ToastContext';

export const Route = createFileRoute('/log-errores')({
  component: LogErroresComponent,
});

function LogErroresComponent() {
  const toast = useToast();
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 25,
  });
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Query para obtener logs de errores
  const {
    data: errorData,
    isLoading: isLoadingLogs,
    error: errorLogs,
    refetch: refetchLogs,
    isFetching: isFetchingLogs,
  } = useQuery({
    queryKey: ['errorLogs', filters],
    queryFn: () => errorLogApi.getErrorLogs(filters),
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
    queryKey: ['errorStats'],
    queryFn: () => errorLogApi.getErrorStats(),
    refetchOnWindowFocus: false,
  });

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
        <HeaderDescriptor title="LOG DE ERRORES" subtitle="REGISTRO DE ERRORES DEL SISTEMA" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error cargando logs de errores</p>
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
      <HeaderDescriptor title="LOG DE ERRORES" subtitle="REGISTRO DE ERRORES DEL SISTEMA" />

      {/* Statistics Section */}
      <div className="flex-shrink-0">
        <ErrorStats 
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
                {isLoadingLogs ? 'Cargando logs de errores...' : 'Actualizando datos...'}
              </p>
            </div>
          </div>
        ) : (
          <ErrorTable
            data={errorData?.logs || []}
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
      <ErrorLogFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        onApplyFilters={handleApplyFilters}
      />

      {/* Detail Modal */}
      <ErrorDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedLog(null);
        }}
        errorLog={selectedLog}
      />
    </div>
  );
}

export default LogErroresComponent;
