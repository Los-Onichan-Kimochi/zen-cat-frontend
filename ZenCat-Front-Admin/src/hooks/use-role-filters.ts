import { useState, useCallback, useMemo } from 'react';
import { User } from '@/types/user';
import { RoleFilters } from '@/components/roles/filters';

export function useRoleFilters(initialFilters: RoleFilters = {}) {
  const [filters, setFilters] = useState<RoleFilters>(initialFilters);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const applyFilters = useCallback((newFilters: RoleFilters) => {
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
  const filterUsers = useCallback((users: User[]): User[] => {
    return users.filter((user) => {
      // Filtro por nombre
      if (filters.name) {
        const userName = user.name?.toLowerCase() || '';
        const searchName = filters.name.toLowerCase();
        if (!userName.includes(searchName)) {
          return false;
        }
      }

      // Filtro por email
      if (filters.email) {
        const email = user.email.toLowerCase();
        const searchEmail = filters.email.toLowerCase();
        if (!email.includes(searchEmail)) {
          return false;
        }
      }

      // Filtro por rol
      if (filters.rol) {
        if (user.rol !== filters.rol) {
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
    filterUsers,
  };
} 