import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';

interface ViewToolbarProps {
  onAddClick: () => void;
  onBulkUploadClick?: () => void;
  addButtonText?: string;
  bulkUploadButtonText?: string;
  showBulkUpload?: boolean;
}

export function ViewToolbar({
  onAddClick,
  onBulkUploadClick,
  addButtonText = 'Agregar',
  bulkUploadButtonText = 'Carga Masiva',
  showBulkUpload = true,
}: ViewToolbarProps) {
  return (
    <div className="flex justify-end gap-3 mb-4 font-montserrat">
      <Button
        onClick={onAddClick}
        className="h-10 bg-black text-white font-bold hover:bg-gray-800 transition-all duration-200"
      >
        <Plus className="mr-2 h-4 w-4" /> {addButtonText}
      </Button>

      {showBulkUpload && (
        <Button
          size="sm"
          className="h-10 bg-black text-white font-bold hover:bg-gray-800 transition-all duration-200 cursor-pointer"
          onClick={
            onBulkUploadClick || (() => {})
          }
        >
          <Upload className="mr-2 h-4 w-4" /> {bulkUploadButtonText}
        </Button>
      )}
    </div>
  );
}
