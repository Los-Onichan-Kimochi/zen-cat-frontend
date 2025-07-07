import { useState, useCallback, useMemo } from 'react';
import { MembershipPlan } from '@/types/membership-plan';
import { MembershipPlanFilters } from '@/components/membership-plan/filters';

export function useMembershipPlanFilters(initialFilters: MembershipPlanFilters = {}) {
  const [filters, setFilters] = useState<MembershipPlanFilters>(initialFilters);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const applyFilters = useCallback((newFilters: MembershipPlanFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
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

  // Función para filtrar los datos
  const filterMembershipPlans = useCallback((plans: MembershipPlan[]): MembershipPlan[] => {
    return plans.filter((plan) => {
      // Filtro por tipo
      if (filters.type) {
        if (plan.type !== filters.type) {
          return false;
        }
      }

      // Filtro por precio mínimo
      if (filters.min_fee !== undefined) {
        if (plan.fee < filters.min_fee) {
          return false;
        }
      }

      // Filtro por precio máximo
      if (filters.max_fee !== undefined) {
        if (plan.fee > filters.max_fee) {
          return false;
        }
      }

      // Filtro por límite de reservas mínimo
      if (filters.min_reservation_limit !== undefined) {
        if (plan.reservation_limit === null || plan.reservation_limit === undefined) {
          return false;
        }
        if (plan.reservation_limit < filters.min_reservation_limit) {
          return false;
        }
      }

      // Filtro por límite de reservas máximo
      if (filters.max_reservation_limit !== undefined) {
        if (plan.reservation_limit === null || plan.reservation_limit === undefined) {
          return false;
        }
        if (plan.reservation_limit > filters.max_reservation_limit) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(
      ([key, value]) =>
        key !== 'page' &&
        key !== 'limit' &&
        value !== undefined &&
        value !== '' &&
        value !== null,
    ).length;
  }, [filters]);

  return {
    filters,
    isModalOpen,
    hasActiveFilters,
    activeFiltersCount,
    applyFilters,
    clearFilters,
    openModal,
    closeModal,
    filterMembershipPlans,
  };
} 