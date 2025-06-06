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
    console.log('Opening modal...'); // Debug
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
        className="px-3 py-2 border-dashed hover:bg-gray-50"
      >
        <Calendar className="h-4 w-4 mr-2" />
        Selector Visual
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
