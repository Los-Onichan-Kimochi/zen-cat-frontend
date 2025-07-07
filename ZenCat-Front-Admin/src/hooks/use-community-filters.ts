import { useState, useCallback, useMemo } from 'react';
import { Community } from '@/types/community';
import { CommunityFilters } from '@/components/community/filters';

export function useCommunityFilters(data: Community[]) {
  const [filters, setFilters] = useState<CommunityFilters>({
    page: 1,
    limit: 25,
  });
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

  // Función para aplicar filtros a los datos
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Filtro por nombre
    if (filters.name?.trim()) {
      const nameQuery = filters.name.toLowerCase().trim();
      filtered = filtered.filter((community) =>
        community.name.toLowerCase().includes(nameQuery)
      );
    }

    // Filtro por propósito
    if (filters.purpose?.trim()) {
      const purposeQuery = filters.purpose.toLowerCase().trim();
      filtered = filtered.filter((community) =>
        community.purpose.toLowerCase().includes(purposeQuery)
      );
    }

    // Filtro por número mínimo de suscripciones
    if (filters.min_subscriptions !== undefined && filters.min_subscriptions !== null) {
      filtered = filtered.filter((community) =>
        community.number_subscriptions >= filters.min_subscriptions!
      );
    }

    // Filtro por número máximo de suscripciones
    if (filters.max_subscriptions !== undefined && filters.max_subscriptions !== null) {
      filtered = filtered.filter((community) =>
        community.number_subscriptions <= filters.max_subscriptions!
      );
    }

    return filtered;
  }, [data, filters]);

  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(
      ([key, value]) =>
        key !== 'page' &&
        key !== 'limit' &&
        value !== undefined &&
        value !== '' &&
        value !== null
    );
  }, [filters]);

  // Función para actualizar filtros
  const updateFilters = useCallback((newFilters: CommunityFilters) => {
    setFilters(newFilters);
  }, []);

  // Función para limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: filters.limit || 25,
    });
  }, [filters.limit]);

  // Función para abrir modal de filtros
  const openFiltersModal = useCallback(() => {
    setIsFiltersModalOpen(true);
  }, []);

  // Función para cerrar modal de filtros
  const closeFiltersModal = useCallback(() => {
    setIsFiltersModalOpen(false);
  }, []);

  // Función para aplicar filtros (cerrar modal)
  const applyFilters = useCallback(() => {
    setIsFiltersModalOpen(false);
  }, []);

  return {
    filters,
    filteredData,
    hasActiveFilters,
    isFiltersModalOpen,
    updateFilters,
    clearFilters,
    openFiltersModal,
    closeFiltersModal,
    applyFilters,
  };
} 