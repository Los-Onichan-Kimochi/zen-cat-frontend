import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ReservationAlertProps {
  message: string;
  type: 'error' | 'success' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function ReservationAlert({ 
  message, 
  type, 
  isVisible, 
  onClose, 
  duration = 4000 
}: ReservationAlertProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowAnimation(true);
      
      // Auto-cerrar después del tiempo especificado
      const timer = setTimeout(() => {
        setShowAnimation(false);
        setTimeout(onClose, 300); // Esperar a que termine la animación
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setShowAnimation(false);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getAlertStyles = () => {
    const baseStyles = "fixed bottom-6 right-6 min-w-[320px] max-w-[400px] px-5 py-4 rounded-xl shadow-2xl border-0 z-50 transition-all duration-500 transform backdrop-blur-sm";
    
    if (!showAnimation) {
      return `${baseStyles} translate-x-full opacity-0 scale-95`;
    }

    switch (type) {
      case 'error':
        return `${baseStyles} bg-gradient-to-r from-red-50 to-red-100 text-red-900 shadow-red-200/50`;
      case 'success':
        return `${baseStyles} bg-gradient-to-r from-green-50 to-green-100 text-green-900 shadow-green-200/50`;
      case 'warning':
        return `${baseStyles} bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-900 shadow-yellow-200/50`;
      default:
        return `${baseStyles} bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 shadow-blue-200/50`;
    }
  };

  const getIcon = () => {
    const iconBaseStyle = "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm";
    
    switch (type) {
      case 'error':
        return (
          <div className={`${iconBaseStyle} bg-gradient-to-br from-red-500 to-red-600 shadow-lg`}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className={`${iconBaseStyle} bg-gradient-to-br from-green-500 to-green-600 shadow-lg`}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className={`${iconBaseStyle} bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg`}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className={`${iconBaseStyle} bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg`}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'error':
        return 'Error';
      case 'success':
        return 'Éxito';
      case 'warning':
        return 'Advertencia';
      default:
        return 'Información';
    }
  };

  return createPortal(
    <div className={getAlertStyles()}>
      <div className="flex items-start gap-4">
        {/* Icono */}
        <div className="mt-0.5">
          {getIcon()}
        </div>
        
        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold tracking-wide">
              {getTitle()}
            </h4>
            
            {/* Botón de cerrar */}
            <button
              onClick={() => {
                setShowAnimation(false);
                setTimeout(onClose, 300);
              }}
              className="ml-3 flex-shrink-0 rounded-full p-1.5 hover:bg-black/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black/20"
              aria-label="Cerrar notificación"
            >
              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Mensaje */}
          <p className="text-sm leading-relaxed mt-1 text-gray-700">
            {message}
          </p>
        </div>
      </div>
      
      {/* Barra de progreso opcional */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-xl overflow-hidden">
        <div 
          className="h-full bg-current opacity-30 rounded-b-xl transition-all duration-[4000ms] ease-linear"
          style={{
            width: showAnimation ? '0%' : '100%',
            transition: showAnimation ? `width ${duration}ms linear` : 'none'
          }}
        />
      </div>
    </div>,
    document.body
  );
}

// Hook personalizado para usar la alerta de reservación
export function useReservationAlert() {
  const [alert, setAlert] = useState<{
    message: string;
    type: 'error' | 'success' | 'warning' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  const showAlert = (message: string, type: 'error' | 'success' | 'warning' | 'info' = 'info') => {
    setAlert({
      message,
      type,
      isVisible: true,
    });
  };

  const hideAlert = () => {
    setAlert(prev => ({
      ...prev,
      isVisible: false,
    }));
  };

  const AlertComponent = () => (
    <ReservationAlert
      message={alert.message}
      type={alert.type}
      isVisible={alert.isVisible}
      onClose={hideAlert}
    />
  );

  return {
    showAlert,
    hideAlert,
    AlertComponent,
    error: (message: string) => showAlert(message, 'error'),
    success: (message: string) => showAlert(message, 'success'),
    warning: (message: string) => showAlert(message, 'warning'),
    info: (message: string) => showAlert(message, 'info'),
  };
} 