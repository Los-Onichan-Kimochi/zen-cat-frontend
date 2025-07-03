import { useState, useCallback } from 'react';
import { Toast, ToastType } from '@/components/ui/toast-container';

let toastId = 0;

export function useCustomToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (
      type: ToastType,
      title: string,
      options?: {
        description?: string;
        duration?: number;
      },
    ) => {
      const id = `toast-${++toastId}`;
      const newToast: Toast = {
        id,
        type,
        title,
        description: options?.description,
        duration: options?.duration || 5000,
      };

      setToasts((prev) => {
        // Limitar a máximo 5 toasts para evitar overflow
        const updated = [...prev, newToast];
        return updated.slice(-5);
      });

      return id;
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (title: string, options?: { description?: string; duration?: number }) => {
      return addToast('success', title, options);
    },
    [addToast],
  );

  const error = useCallback(
    (title: string, options?: { description?: string; duration?: number }) => {
      return addToast('error', title, options);
    },
    [addToast],
  );

  const info = useCallback(
    (title: string, options?: { description?: string; duration?: number }) => {
      return addToast('info', title, options);
    },
    [addToast],
  );

  const warning = useCallback(
    (title: string, options?: { description?: string; duration?: number }) => {
      return addToast('warning', title, options);
    },
    [addToast],
  );

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    success,
    error,
    info,
    warning,
    removeToast,
    clearAll,
  };
}
