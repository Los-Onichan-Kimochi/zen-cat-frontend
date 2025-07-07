import { useState, useCallback, useMemo } from 'react';
import { UserFilters } from '@/components/usuarios/filters';
import { User } from '@/types/user';

export const useUserFilters = () => {
  const [filters, setFilters] = useState<UserFilters>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const applyFilters = useCallback((newFilters: UserFilters) => {
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

  const filterUsers = useCallback((users: User[]) => {
    if (!hasActiveFilters) return users;

    return users.filter(user => {
      // Filtro por nombre
      if (filters.name && !user.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }

      // Filtro por email
      if (filters.email && !user.email.toLowerCase().includes(filters.email.toLowerCase())) {
        return false;
      }

      // Filtro por rol
      if (filters.rol && user.rol !== filters.rol) {
        return false;
      }

      // Filtro por distrito
      if (filters.district && user.district && !user.district.toLowerCase().includes(filters.district.toLowerCase())) {
        return false;
      }

      // Filtro por ciudad
      if (filters.city && user.city && !user.city.toLowerCase().includes(filters.city.toLowerCase())) {
        return false;
      }

      // Filtro por teléfono
      if (filters.phone && user.phone && !user.phone.includes(filters.phone)) {
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
    filterUsers,
  };
}; 