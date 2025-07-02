import React from 'react';
import { Activity, CheckCircle, Users } from 'lucide-react';
import { AuditLogStats } from '@/types/audit';
import { Skeleton } from '@/components/ui/skeleton';

interface AuditStatsProps {
  stats?: AuditLogStats;
  isLoading?: boolean;
}

export function AuditStats({ stats, isLoading }: AuditStatsProps) {
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

  const statsCards = [
    {
      title: 'Total de Eventos',
      value: stats.totalEvents.toLocaleString(),
      icon: Activity,
      description: 'Eventos registrados',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Eventos Exitosos',
      value: stats.successfulEvents.toLocaleString(),
      icon: CheckCircle,
      description: 'Operaciones completadas',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Usuarios Activos',
      value: stats.activeUsers?.toLocaleString() || '0',
      icon: Users,
      description: 'Usuarios con actividad',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
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
