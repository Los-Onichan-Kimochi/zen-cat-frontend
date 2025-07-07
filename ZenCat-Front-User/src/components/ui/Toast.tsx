import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ToastProps {
  message: string;
  type?: 'error' | 'success' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'info', duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mostrar el toast
    setIsVisible(true);

    // Auto-cerrar después del tiempo especificado
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Esperar a que termine la animación
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    const baseStyles = "fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg border max-w-sm z-50 transition-all duration-300 transform";
    
    if (!isVisible) {
      return `${baseStyles} translate-x-full opacity-0`;
    }

    switch (type) {
      case 'error':
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`;
      case 'success':
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`;
      default:
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return createPortal(
    <div className={getToastStyles()}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{getIcon()}</span>
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-2 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
    </div>,
    document.body
  );
}

// Hook para usar el toast
export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastProps['type'] }>>([]);
  const MAX_TOASTS = 3; // Máximo 3 toasts simultáneos
  const lastToastTime = useRef<number>(0);
  const DEBOUNCE_TIME = 1000; // 1 segundo de debounce

  const showToast = (message: string, type: ToastProps['type'] = 'info') => {
    const now = Date.now();
    
    // Debounce: evitar toasts muy frecuentes
    if (now - lastToastTime.current < DEBOUNCE_TIME) {
      return;
    }
    
    lastToastTime.current = now;

    setToasts(prev => {
      // Verificar si ya existe un toast con el mismo mensaje y tipo
      const existingToast = prev.find(toast => toast.message === message && toast.type === type);
      if (existingToast) {
        // Si ya existe, no agregar uno nuevo
        return prev;
      }
      
      // Si no existe, agregar el nuevo toast
      const id = now.toString();
      const newToasts = [...prev, { id, message, type }];
      
      // Limitar el número máximo de toasts
      if (newToasts.length > MAX_TOASTS) {
        // Remover los toasts más antiguos si excedemos el límite
        return newToasts.slice(-MAX_TOASTS);
      }
      
      return newToasts;
    });
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  const ToastContainer = () => (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );

  return {
    showToast,
    ToastContainer,
    clearAllToasts,
    error: (message: string) => showToast(message, 'error'),
    success: (message: string) => showToast(message, 'success'),
    warning: (message: string) => showToast(message, 'warning'),
    info: (message: string) => showToast(message, 'info'),
  };
} 