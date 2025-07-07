import { useState, useCallback, useMemo } from 'react';
import { UserFilters } from '@/components/usuarios/filters';
import { User } from '@/types/user';

export interface UsersFilters {
  search?: string;
  phone?: string;
  document?: string;
  district?: string;
}

export const useUserFilters = () => {
  const [filters, setFilters] = useState<UsersFilters>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const applyFilters = useCallback((newFilters: UsersFilters) => {
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
      // search on name or email
      if (filters.search) {
        const term = filters.search.toLowerCase();
        if (
          !user.name.toLowerCase().includes(term) &&
          !user.email.toLowerCase().includes(term)
        ) {
          return false;
        }
      }

      if (filters.phone) {
        const phoneVal = user.onboarding?.phoneNumber || '';
        if (!phoneVal.includes(filters.phone)) return false;
      }

      if (filters.document) {
        const docNum = user.onboarding?.documentNumber || '';
        if (!docNum.includes(filters.document)) return false;
      }

      if (filters.district) {
        const dist = user.onboarding?.district || '';
        if (!dist.toLowerCase().includes(filters.district.toLowerCase())) return false;
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