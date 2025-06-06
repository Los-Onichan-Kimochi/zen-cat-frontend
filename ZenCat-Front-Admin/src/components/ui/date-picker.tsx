'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { es } from 'date-fns/locale';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  className?: string;
  occupiedDates?: string[]; // Array de fechas en formato 'YYYY-MM-DD'
  onMonthChange?: (month: Date) => void; // Callback cuando cambia el mes
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = 'Seleccionar fecha',
  disabled,
  className,
  occupiedDates = [],
  onMonthChange,
}: DatePickerProps) {
  // Función para verificar si una fecha está ocupada
  const isOccupied = (checkDate: Date) => {
    const dateString = checkDate.toISOString().split('T')[0];
    return occupiedDates.includes(dateString);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, 'PPP', { locale: es })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          disabled={disabled}
          initialFocus
          onMonthChange={onMonthChange}
          classNames={{
            day: cn(
              'h-9 w-9 p-0 font-normal aria-selected:opacity-100 transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              'focus:bg-accent focus:text-accent-foreground',
            ),
          }}
          modifiers={{
            occupied: isOccupied,
          }}
          modifiersClassNames={{
            occupied:
              "bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800 font-medium relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:transform after:-translate-x-1/2 after:w-1 after:h-1 after:bg-red-500 after:rounded-full",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
