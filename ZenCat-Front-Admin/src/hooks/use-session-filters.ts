import { useState, useCallback, useMemo } from 'react';
import { SessionFilters } from '@/components/sessions/filters';
import { Session } from '@/types/session';

export const useSessionFilters = () => {
  const [filters, setFilters] = useState<SessionFilters>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const applyFilters = useCallback((newFilters: SessionFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(
      ([key, value]) =>
        key !== 'page' &&
        key !== 'limit' &&
        value !== undefined &&
        value !== '' &&
        value !== null,
    );
  }, [filters]);

  const filterSessions = useCallback((sessions: Session[]) => {
    if (!hasActiveFilters) return sessions;

    return sessions.filter(session => {
      // Filtro por título
      if (filters.title && !session.title.toLowerCase().includes(filters.title.toLowerCase())) {
        return false;
      }

      // Filtro por fecha
      if (filters.date && session.date !== filters.date) {
        return false;
      }

      // Filtro por estado
      if (filters.state && session.state !== filters.state) {
        return false;
      }

      // Filtro por profesional
      if (filters.professional_id && session.professional_id !== filters.professional_id) {
        return false;
      }

      // Filtro por local
      if (filters.local_id && session.local_id !== filters.local_id) {
        return false;
      }

      // Filtro por capacidad mínima
      if (filters.min_capacity && session.capacity < filters.min_capacity) {
        return false;
      }

      // Filtro por capacidad máxima
      if (filters.max_capacity && session.capacity > filters.max_capacity) {
        return false;
      }

      // Filtro por registrados mínimo
      if (filters.min_registered && session.registered_count < filters.min_registered) {
        return false;
      }

      // Filtro por registrados máximo
      if (filters.max_registered && session.registered_count > filters.max_registered) {
        return false;
      }

      return true;
    });
  }, [filters, hasActiveFilters]);

  return {
    filters,
    isModalOpen,
    hasActiveFilters,
    openModal,
    closeModal,
    applyFilters,
    clearFilters,
    filterSessions,
  };
}; 