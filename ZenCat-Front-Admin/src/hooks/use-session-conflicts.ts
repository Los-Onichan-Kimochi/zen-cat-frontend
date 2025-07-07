import { useQuery } from '@tanstack/react-query';
import {
  sessionsApi,
  CheckConflictRequest,
  ConflictResult,
  AvailabilityRequest,
  AvailabilityResult,
} from '@/api/sessions/sessions';
import { useMemo } from 'react';

interface ConflictCheck {
  date: string;
  startTime: string;
  endTime: string;
  professionalId?: string;
  localId?: string;
  excludeSessionId?: string;
}

interface OptimizedConflictResult {
  hasConflict: boolean;
  conflicts: {
    professional: any[];
    local: any[];
    overlapping: any[];
  };
  isLoading: boolean;
}

export function useSessionConflicts(
  check: ConflictCheck,
): OptimizedConflictResult {
  const { data, isLoading } = useQuery<ConflictResult>({
    queryKey: [
      'session-conflicts',
      check.date,
      check.startTime,
      check.endTime,
      check.professionalId,
      check.localId,
      check.excludeSessionId,
    ],
    queryFn: () => {
      if (
        !check.professionalId ||
        !check.date ||
        !check.startTime ||
        !check.endTime
      ) {
        return Promise.resolve({
          hasConflict: false,
          professionalConflicts: [],
          localConflicts: [],
        });
      }

      const request: CheckConflictRequest = {
        date: check.date,
        startTime: check.startTime,
        endTime: check.endTime,
        professionalId: check.professionalId,
        localId: check.localId,
        excludeId: check.excludeSessionId,
      };

      return sessionsApi.checkConflicts(request);
    },
    enabled: !!(
      check.date &&
      check.startTime &&
      check.endTime &&
      check.professionalId
    ),
  });

  return useMemo(() => {
    if (isLoading || !data) {
      return {
        hasConflict: false,
        conflicts: { professional: [], local: [], overlapping: [] },
        isLoading: true,
      };
    }

    const allConflicts = [
      ...data.professionalConflicts,
      ...data.localConflicts,
    ];

    return {
      hasConflict: data.hasConflict,
      conflicts: {
        professional: data.professionalConflicts,
        local: data.localConflicts,
        overlapping: allConflicts,
      },
      isLoading: false,
    };
  }, [data, isLoading]);
}

export function useDayAvailability(
  date: string,
  professionalId?: string,
  localId?: string,
  excludeSessionId?: string,
) {
  const { data, isLoading } = useQuery<AvailabilityResult>({
    queryKey: ['day-availability', date, professionalId, localId, excludeSessionId],
    queryFn: () => {
      if (!date || (!professionalId && !localId)) {
        return Promise.resolve({ isAvailable: true, busySlots: [] });
      }

      const request: AvailabilityRequest = {
        date,
        professionalId,
        localId,
        excludeSessionId,
      };

      return sessionsApi.getAvailability(request);
    },
    enabled: !!(date && (professionalId || localId)),
  });

  return useMemo(() => {
    if (isLoading || !data) {
      return { isAvailable: true, busySlots: [] };
    }

    return {
      isAvailable: data.isAvailable,
      busySlots: data.busySlots,
    };
  }, [data, isLoading]);
}

// Hook para obtener los días ocupados en un mes
export function useMonthlyAvailability(
  month: Date,
  professionalId?: string,
  localId?: string,
) {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const startDate = startOfMonth.toISOString().split('T')[0];
  const endDate = endOfMonth.toISOString().split('T')[0];

  const { data, isLoading } = useQuery({
    queryKey: [
      'monthly-availability',
      startDate,
      endDate,
      professionalId,
      localId,
    ],
    queryFn: async () => {
      if (!professionalId && !localId) {
        return { occupiedDates: [] };
      }

      // Obtener sesiones del mes con filtros apropiados
      const filters = {
        professionalIds: professionalId ? [professionalId] : undefined,
        localIds: localId ? [localId] : undefined,
      };

      const sessions = await sessionsApi.getSessions(filters);

      // Filtrar sesiones del mes y extraer fechas únicas
      const occupiedDates = [
        ...new Set(
          sessions
            .filter((session) => {
              const sessionDate = new Date(session.date);
              return sessionDate >= startOfMonth && sessionDate <= endOfMonth;
            })
            .map(
              (session) => new Date(session.date).toISOString().split('T')[0],
            ),
        ),
      ];

      return { occupiedDates };
    },
    enabled: !!(professionalId || localId),
  });

  return useMemo(() => {
    if (isLoading || !data) {
      return { occupiedDates: [], isLoading: true };
    }

    return {
      occupiedDates: data.occupiedDates,
      isLoading: false,
    };
  }, [data, isLoading]);
}
