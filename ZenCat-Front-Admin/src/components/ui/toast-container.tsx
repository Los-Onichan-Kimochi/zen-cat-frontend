import React from 'react';
import { CustomToast, ToastType } from './custom-toast';

// Re-export ToastType for use in other components
export type { ToastType };

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 pointer-events-none">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="pointer-events-auto"
          style={{
            transform: `translateY(-${index * 8}px)`,
            zIndex: 50 - index,
          }}
        >
          <CustomToast
            id={toast.id}
            type={toast.type}
            title={toast.title}
            description={toast.description}
            duration={toast.duration}
            onRemove={onRemove}
          />
        </div>
      ))}
    </div>
  );
}
