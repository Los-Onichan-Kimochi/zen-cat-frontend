import React from 'react';
import { AlertTriangle, TrendingDown, Users } from 'lucide-react';
import { ErrorLogStats } from '@/types/error-log';
import { Skeleton } from '@/components/ui/skeleton';

interface ErrorStatsProps {
  stats?: ErrorLogStats;
  isLoading?: boolean;
}

export function ErrorStats({ stats, isLoading }: ErrorStatsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center space-x-4 mt-2 font-montserrat min-h-[120px] flex-wrap">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl shadow-xl p-6 flex items-center space-x-6 min-w-[350px]"
          >
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const totalErrors = stats.totalEvents || 0;
  const criticalErrors = stats.failedEvents || 0;
  const uniqueUsers = stats.uniqueUsers || 0; // Asumiendo que el backend puede proporcionar esto

  const statsCards = [
    {
      title: 'Total de Errores',
      value: totalErrors.toLocaleString(),
      icon: AlertTriangle,
      description: 'Errores registrados',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Errores Críticos',
      value: criticalErrors.toLocaleString(),
      icon: TrendingDown,
      description: 'Errores críticos del sistema',
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
    },
    {
      title: 'Usuarios Afectados',
      value: uniqueUsers.toLocaleString(),
      icon: Users,
      description: 'Usuarios con errores',
      color: 'text-slate-700',
      bgColor: 'bg-slate-200',
    },
  ];

  return (
    <div className="flex items-center justify-center space-x-4 mt-2 font-montserrat min-h-[120px] flex-wrap">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-3xl shadow-xl p-6 flex items-center space-x-6 min-w-[350px] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
          >
            <div
              className={`p-4 rounded-full ${stat.bgColor} transition-colors duration-200 hover:scale-110`}
            >
              <Icon
                className={`w-8 h-8 ${stat.color} transition-transform duration-200`}
              />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium transition-colors duration-200">
                {stat.title}
              </p>
              <p
                className={`text-2xl font-semibold ${stat.color} transition-colors duration-200`}
              >
                {stat.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ErrorStats;
