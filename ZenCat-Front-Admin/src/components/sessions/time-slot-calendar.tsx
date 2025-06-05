import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TimeSlot {
  time: string;
  label: string;
  isOccupied: boolean;
  occupiedBy?: string;
  occupiedType?: 'professional' | 'local';
}

interface TimeRange {
  start: string;
  end: string;
}

interface TimeSlotCalendarProps {
  selectedRange?: TimeRange;
  onRangeSelect: (range: TimeRange) => void;
  occupiedSlots: Array<{
    start: string;
    end: string;
    title: string;
    type: 'professional' | 'local';
  }>;
  startHour?: number;
  endHour?: number;
  slotDuration?: number; // minutos
  disabled?: boolean;
}

export function TimeSlotCalendar({
  selectedRange,
  onRangeSelect,
  occupiedSlots = [],
  startHour = 8,
  endHour = 20,
  slotDuration = 30,
  disabled = false,
}: TimeSlotCalendarProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [previewEnd, setPreviewEnd] = useState<string | null>(null);

  // Generar slots de tiempo
  const timeSlots = useMemo(() => {
    const slots: TimeSlot[] = [];
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const nextMinute = minute + slotDuration;
        const nextHour = nextMinute >= 60 ? hour + 1 : hour;
        const adjustedMinute = nextMinute >= 60 ? nextMinute - 60 : nextMinute;
        
        // Verificar si este slot está ocupado
        const isOccupied = occupiedSlots.some(occupied => {
          const occupiedStart = occupied.start;
          const occupiedEnd = occupied.end;
          return time >= occupiedStart && time < occupiedEnd;
        });

        const occupiedSlot = occupiedSlots.find(occupied => 
          time >= occupied.start && time < occupied.end
        );

        slots.push({
          time,
          label: time,
          isOccupied,
          occupiedBy: occupiedSlot?.title,
          occupiedType: occupiedSlot?.type,
        });
      }
    }
    
    return slots;
  }, [startHour, endHour, slotDuration, occupiedSlots]);

  // Verificar si un slot está en el rango seleccionado
  const isInSelectedRange = useCallback((time: string) => {
    if (!selectedRange) return false;
    return time >= selectedRange.start && time < selectedRange.end;
  }, [selectedRange]);

  // Verificar si un slot está en el rango de preview
  const isInPreviewRange = useCallback((time: string) => {
    if (!selectionStart || !previewEnd) return false;
    const start = selectionStart <= previewEnd ? selectionStart : previewEnd;
    const end = selectionStart <= previewEnd ? previewEnd : selectionStart;
    return time >= start && time < end;
  }, [selectionStart, previewEnd]);

  // Manejar inicio de selección
  const handleSlotMouseDown = useCallback((time: string, slot: TimeSlot) => {
    if (disabled || slot.isOccupied) return;
    
    setIsSelecting(true);
    setSelectionStart(time);
    setPreviewEnd(time);
  }, [disabled]);

  // Manejar movimiento durante selección
  const handleSlotMouseEnter = useCallback((time: string) => {
    if (!isSelecting || !selectionStart) return;
    setPreviewEnd(time);
  }, [isSelecting, selectionStart]);

  // Manejar fin de selección
  const handleSlotMouseUp = useCallback(() => {
    if (!isSelecting || !selectionStart || !previewEnd) return;

    const start = selectionStart <= previewEnd ? selectionStart : previewEnd;
    const end = selectionStart <= previewEnd ? previewEnd : selectionStart;
    
    // Calcular el tiempo de fin (siguiente slot)
    const startIndex = timeSlots.findIndex(slot => slot.time === start);
    const endIndex = timeSlots.findIndex(slot => slot.time === end);
    const finalEndIndex = Math.max(startIndex + 1, endIndex + 1);
    const finalEnd = timeSlots[finalEndIndex]?.time || end;

    onRangeSelect({ start, end: finalEnd });
    
    setIsSelecting(false);
    setSelectionStart(null);
    setPreviewEnd(null);
  }, [isSelecting, selectionStart, previewEnd, timeSlots, onRangeSelect]);

  // Limpiar selección al hacer clic fuera
  const handleCalendarMouseLeave = useCallback(() => {
    if (isSelecting) {
      setIsSelecting(false);
      setSelectionStart(null);
      setPreviewEnd(null);
    }
  }, [isSelecting]);

  return (
    <div className="border rounded-lg bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-medium text-gray-900">Selecciona horario</h3>
        <p className="text-sm text-gray-500 mt-1">
          Haz clic y arrastra para seleccionar el rango de tiempo
        </p>
        {selectedRange && (
          <div className="mt-2 text-sm font-medium text-blue-600">
            Seleccionado: {selectedRange.start} - {selectedRange.end}
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <div 
        className="p-4 select-none"
        onMouseLeave={handleCalendarMouseLeave}
        onMouseUp={handleSlotMouseUp}
      >
        <div className="grid grid-cols-1 gap-1 max-h-96 overflow-y-auto">
          {timeSlots.map((slot) => {
            const isSelected = isInSelectedRange(slot.time);
            const isPreview = isInPreviewRange(slot.time);
            const isSelectable = !slot.isOccupied && !disabled;

            return (
              <div
                key={slot.time}
                className={cn(
                  "p-2 text-sm border rounded cursor-pointer transition-all duration-150",
                  {
                    // Estado base
                    "bg-white border-gray-200 hover:bg-gray-50": isSelectable && !isSelected && !isPreview,
                    
                    // Ocupado
                    "bg-red-50 border-red-200 cursor-not-allowed": slot.isOccupied && slot.occupiedType === 'professional',
                    "bg-blue-50 border-blue-200 cursor-not-allowed": slot.isOccupied && slot.occupiedType === 'local',
                    
                    // Seleccionado
                    "bg-green-100 border-green-300": isSelected,
                    
                    // Preview durante selección
                    "bg-green-50 border-green-200": isPreview && !isSelected,
                    
                    // Deshabilitado
                    "bg-gray-100 border-gray-200 cursor-not-allowed": disabled,
                  }
                )}
                onMouseDown={() => handleSlotMouseDown(slot.time, slot)}
                onMouseEnter={() => handleSlotMouseEnter(slot.time)}
                title={slot.isOccupied ? `Ocupado: ${slot.occupiedBy}` : slot.time}
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "font-mono",
                    {
                      "text-gray-900": isSelectable,
                      "text-red-600": slot.isOccupied && slot.occupiedType === 'professional',
                      "text-blue-600": slot.isOccupied && slot.occupiedType === 'local',
                      "text-gray-500": disabled,
                    }
                  )}>
                    {slot.label}
                  </span>
                  
                  {slot.isOccupied && (
                    <div className="flex items-center gap-1">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        {
                          "bg-red-400": slot.occupiedType === 'professional',
                          "bg-blue-400": slot.occupiedType === 'local',
                        }
                      )} />
                      <span className="text-xs text-gray-600 truncate max-w-20">
                        {slot.occupiedBy}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span>Seleccionado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
            <span>Profesional ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
            <span>Local ocupado</span>
          </div>
        </div>
      </div>
    </div>
  );
} 