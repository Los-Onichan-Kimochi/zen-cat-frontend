'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface CalendarProps {
  mode?: 'single';
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
  locale?: any; // Mantenemos compatibilidad pero no la usamos
  [key: string]: any; // Para otras props que puedan pasar
}

const MONTHS_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const DAYS_ES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

function Calendar({
  mode = 'single',
  selected,
  onSelect,
  disabled,
  className,
  ...props
}: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(() => {
    return selected || new Date();
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Obtener primer día del mes (0 = domingo, 1 = lunes, etc.)
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Ajustar para que lunes sea 0 (en lugar de domingo)
  const startDay = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();

  // Generar días del calendario
  const calendarDays: Array<{
    day: number;
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
  }> = [];

  // Días del mes anterior
  const prevMonth = new Date(year, month - 1, 0);
  for (let i = startDay - 1; i >= 0; i--) {
    const day = prevMonth.getDate() - i;
    calendarDays.push({
      day,
      date: new Date(year, month - 1, day),
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Días del mes actual
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    calendarDays.push({
      day,
      date,
      isCurrentMonth: true,
      isToday,
    });
  }

  // Días del mes siguiente para completar la grilla
  const remainingDays = 42 - calendarDays.length; // 6 semanas * 7 días
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      date: new Date(year, month + 1, day),
      isCurrentMonth: false,
      isToday: false,
    });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (date: Date) => {
    if (disabled && disabled(date)) return;
    onSelect?.(date);
  };

  const isSelected = (date: Date) => {
    if (!selected) return false;
    return (
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear()
    );
  };

  return (
    <div className={cn('p-3', className)}>
      {/* Header con navegación */}
      <div className="flex justify-center pt-1 relative items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          className="absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          onClick={handlePrevMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-sm font-medium">
          {MONTHS_ES[month]} {year}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          onClick={handleNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS_ES.map((day) => (
          <div
            key={day}
            className="h-9 w-9 text-center text-[0.8rem] font-normal text-muted-foreground flex items-center justify-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grilla de días */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((calendarDay, index) => {
          const isDisabled = disabled && disabled(calendarDay.date);
          const isSelectedDay = isSelected(calendarDay.date);

          return (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={cn(
                'h-9 w-9 p-0 font-normal',
                !calendarDay.isCurrentMonth &&
                  'text-muted-foreground opacity-50',
                calendarDay.isToday && 'bg-accent text-accent-foreground',
                isSelectedDay &&
                  'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                isDisabled &&
                  'text-muted-foreground opacity-50 cursor-not-allowed',
              )}
              onClick={() => !isDisabled && handleDayClick(calendarDay.date)}
              disabled={isDisabled}
            >
              {calendarDay.day}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };
