import { useState } from 'react';

export type ModalType = 'success' | 'error' | 'info';

interface ModalState {
  isOpen: boolean;
  type: ModalType;
  title: string;
  description: string;
}

export function useModalNotifications() {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: 'success',
    title: '',
    description: '',
  });

  const showModal = (type: ModalType, title: string, description: string) => {
    setModal({
      isOpen: true,
      type,
      title,
      description,
    });
  };

  const success = (title: string, options?: { description?: string }) => {
    showModal('success', title, options?.description || '');
  };

  const error = (title: string, options?: { description?: string }) => {
    showModal('error', title, options?.description || '');
  };

  const info = (title: string, options?: { description?: string }) => {
    showModal('info', title, options?.description || '');
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  return {
    modal,
    success,
    error,
    info,
    closeModal,
  };
} 