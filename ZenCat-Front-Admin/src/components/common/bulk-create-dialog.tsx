'use client';

import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { Upload, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import ErrorDialog from "@/components/common/error-dialog";

interface BulkCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  expectedExcelColumns: string[];
  dbFieldNames: string[];
  onParsedData: (data: any[]) => void;
}

export function BulkCreateDialog({
  open,
  onOpenChange,
  title = "Carga Masiva de Datos",
  onParsedData,
  expectedExcelColumns,
  dbFieldNames,
}: BulkCreateDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showColumnErrorDialog, setShowColumnErrorDialog] = useState(false);
  const [columnErrorMessage, setColumnErrorMessage] = useState("");

  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setError(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [open]);

  const isValidXLSX = (file: File) =>
    file.name.toLowerCase().endsWith(".xlsx");

  const handleFile = (file: File) => {
    if (isValidXLSX(file)) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError("Solo se permiten archivos con extensión .xlsx");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const mapDataWithColumns = (data: any[]) => {
    return data.map(item => {
      const mappedObject: Record<string, any> = {};
      expectedExcelColumns.forEach((excelCol, idx) => {
        const dbCol = dbFieldNames[idx];
        mappedObject[dbCol] = item[excelCol] ?? "";
      });
      return mappedObject;
    });
  };

  const handleConfirm = () => {
    if (!selectedFile) {
      setError("Debe seleccionar un archivo .xlsx antes de continuar");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
        
        function normalizeText(text: string): string {
          return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        }

        const normalizedHeaders = headers.map(normalizeText);
        const normalizedExpected = expectedExcelColumns.map(normalizeText);
  
        const headersAreValid =
          normalizedHeaders.length === normalizedExpected.length &&
          normalizedExpected.every(col => normalizedHeaders.includes(col));

        if (!headersAreValid) {
          setColumnErrorMessage(`El archivo debe contener las siguientes columnas: ${expectedExcelColumns.join(", ")}`);
          setShowColumnErrorDialog(true);
          return;
        }

        const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        const finalData = mapDataWithColumns(rawData);

        if (!finalData || finalData.length === 0) {
          setError("El archivo está vacío o mal estructurado.");
          return;
        }

        onParsedData(finalData);
        setSelectedFile(null);
        setError(null);
        onOpenChange(false);
      } catch (err) {
        setError("Error al procesar el archivo.");
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDelete = () => {
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          {/* Zona para soltar archivo */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
          >
            <Upload className="h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-lg font-semibold text-gray-700">
              Suelte aquí su archivo
            </h2>
          </div>

          {/* Área de selección por clic */}
          <div
            onClick={() => inputRef.current?.click()}
            className="flex items-center justify-between border rounded px-4 py-2 w-full bg-white shadow-sm cursor-pointer hover:bg-gray-50 mt-4 transition"
          >
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Upload className="h-4 w-4 text-gray-500" />
              {selectedFile ? selectedFile.name : "Seleccionar archivo .xlsx"}
            </div>
            {selectedFile && (
              <Trash
                className="h-4 w-4 text-red-500 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
              />
            )}
          </div>

          <input
            type="file"
            accept=".xlsx"
            ref={inputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {error && (
            <p className="text-sm text-red-500 mt-2 text-left">{error}</p>
          )}

          <DialogFooter>
            <Button variant="outline" asChild>
              <DialogClose>Cancelar</DialogClose>
            </Button>
            <Button
              className="bg-gray-800 hover:bg-gray-700"
              onClick={handleConfirm}
            >
              Confirmar carga
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ErrorDialog
        open={showColumnErrorDialog}
        onOpenChange={setShowColumnErrorDialog}
        title="Error en las columnas del archivo"
        message={columnErrorMessage}
      />
    </>
  );
}