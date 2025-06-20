import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UploadCloud } from 'lucide-react';

interface ImageUploadProps {
  imagePreview: string | null;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  disabled?: boolean;
  accept?: string;
  className?: string;
  inputId?: string;
  inputProps?: any;
  errorMessage?: string;
}

export function ImageUpload({
  imagePreview,
  onImageChange,
  label = 'Foto de perfil',
  disabled = false,
  accept = 'image/png, image/jpeg, image/gif',
  className = '',
  inputId = 'profileImageFile',
  inputProps = {},
  errorMessage,
}: ImageUploadProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <Label htmlFor={inputId} className="mb-2 self-start">
        {label}
      </Label>
      <div className="w-full h-100 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50 mb-4 relative">
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Vista previa"
            className="object-contain h-full w-full rounded-md"
          />
        ) : (
          <div className="text-center text-gray-400">
            <UploadCloud size={48} className="mx-auto" />
            <p>Arrastra o selecciona un archivo</p>
            <p className="text-xs">PNG, JPG, GIF hasta 10MB</p>
          </div>
        )}
        <Input
          id={inputId}
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept={accept}
          disabled={disabled}
          {...inputProps}
          onChange={onImageChange}
        />
      </div>
      {errorMessage && (
        <p className="text-red-500 text-sm mt-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
} 