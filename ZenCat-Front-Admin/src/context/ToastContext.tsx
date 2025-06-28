import React, { createContext, useContext, ReactNode } from 'react';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { ToastContainer } from '@/components/ui/toast-container';

export interface ToastContextType {
  success: (
    title: string,
    options?: { description?: string; duration?: number },
  ) => string;
  error: (
    title: string,
    options?: { description?: string; duration?: number },
  ) => string;
  info: (
    title: string,
    options?: { description?: string; duration?: number },
  ) => string;
  warning: (
    title: string,
    options?: { description?: string; duration?: number },
  ) => string;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { toasts, success, error, info, warning, removeToast, clearAll } =
    useCustomToast();

  const contextValue = {
    success,
    error,
    info,
    warning,
    clearAll,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
