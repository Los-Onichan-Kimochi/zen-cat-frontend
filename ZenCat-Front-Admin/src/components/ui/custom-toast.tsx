import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  onRemove: (id: string) => void;
}

export function CustomToast({
  id,
  type,
  title,
  description,
  duration = 5000,
  onRemove,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Entrada animada
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Barra de progreso
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          clearInterval(interval);
          handleRemove();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, id]);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(id), 300);
  };

  const getToastStyles = () => {
    const baseStyles = "relative overflow-hidden bg-white border-l-4 shadow-lg rounded-lg min-w-[320px] max-w-[420px]";
    
    switch (type) {
      case 'success':
        return `${baseStyles} border-l-green-500`;
      case 'error':
        return `${baseStyles} border-l-red-500`;
      case 'warning':
        return `${baseStyles} border-l-yellow-500`;
      case 'info':
        return `${baseStyles} border-l-blue-500`;
      default:
        return `${baseStyles} border-l-gray-500`;
    }
  };

  const getIcon = () => {
    const iconStyles = "w-5 h-5 flex-shrink-0";
    
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconStyles} text-green-600`} />;
      case 'error':
        return <AlertCircle className={`${iconStyles} text-red-600`} />;
      case 'warning':
        return <AlertTriangle className={`${iconStyles} text-yellow-600`} />;
      case 'info':
        return <Info className={`${iconStyles} text-blue-600`} />;
      default:
        return <Info className={`${iconStyles} text-gray-600`} />;
    }
  };

  const getProgressBarColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-400 to-green-600';
      case 'error':
        return 'bg-gradient-to-r from-red-400 to-red-600';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'info':
        return 'bg-gradient-to-r from-blue-400 to-blue-600';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  };

  return (
    <div
      className={`${getToastStyles()} transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      {/* Contenido principal */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              {title}
            </p>
            {description && (
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={handleRemove}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-full hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
        <div
          className={`h-full ${getProgressBarColor()} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
} 