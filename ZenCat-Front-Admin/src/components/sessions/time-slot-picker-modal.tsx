import React from 'react';
import { Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TimeSlotCalendar } from './time-slot-calendar';

interface TimeRange {
  start: string;
  end: string;
}

interface TimeSlotPickerModalProps {
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

export function TimeSlotPickerModal({
  selectedRange,
  onRangeSelect,
  occupiedSlots = [],
  disabled = false,
}: TimeSlotPickerModalProps) {
  const [open, setOpen] = React.useState(false);

  const handleRangeSelect = (range: TimeRange) => {
    onRangeSelect(range);
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {

    setOpen(newOpen);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={handleButtonClick}
          className="px-3 py-2 border-dashed hover:bg-gray-50"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Selector Visual
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Selector de Horarios
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
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

        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            Haz clic y arrastra para seleccionar
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
