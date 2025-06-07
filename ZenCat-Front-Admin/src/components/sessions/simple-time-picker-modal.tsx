import React from 'react';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimeSlotCalendar } from './time-slot-calendar';

interface TimeRange {
  start: string;
  end: string;
}

interface SimpleTimePickerModalProps {
  selectedRange?: TimeRange;
  onRangeSelect: (range: TimeRange) => void;
  occupiedSlots: Array<{
    start: string;
    end: string;
    title: string;
    type: 'professional' | 'local';
  }>;
  disabled?: boolean;
}

export function SimpleTimePickerModal({
  selectedRange,
  onRangeSelect,
  occupiedSlots = [],
  disabled = false,
}: SimpleTimePickerModalProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleRangeSelect = (range: TimeRange) => {
    onRangeSelect(range);
    setIsOpen(false);
  };

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={handleOpenModal}
        className={`px-3 py-2 transition-all duration-200 ${
          disabled
            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
            : selectedRange
              ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
              : 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 border-dashed'
        }`}
      >
        <Calendar className="h-4 w-4 mr-2" />
        {disabled 
          ? 'Selector Deshabilitado' 
          : selectedRange 
            ? `${selectedRange.start} - ${selectedRange.end}` 
            : 'Selector Visual de Horario'
        }
      </Button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={handleCloseModal}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Selector de Horarios
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCloseModal}
                className="p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Calendar */}
            <div className="mb-4">
              <TimeSlotCalendar
                selectedRange={selectedRange}
                onRangeSelect={handleRangeSelect}
                occupiedSlots={occupiedSlots}
                disabled={disabled}
                startHour={8}
                endHour={20}
                slotDuration={30}
              />
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Haz clic y arrastra para seleccionar
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCloseModal}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
