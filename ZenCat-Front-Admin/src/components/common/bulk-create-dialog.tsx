'use client';

import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx'; // Librería para leer archivos .xlsx
import { Upload, Trash } from 'lucide-react'; // Íconos de carga y eliminar
import { Button } from '@/components/ui/button'; // Componente de botón
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import ErrorDialog from '@/components/common/error-dialog';
import { toast } from 'sonner';

interface BulkCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  expectedExcelColumns: string[]; // Columnas esperadas en el archivo Excel
  dbFieldNames: string[]; // Nombres de los campos como se usan en la BD
  //onParsedData: (data: any[]) => void;
  //onParsedData: (data: any[], setError?: (message: string) => void) => void;
  onParsedData: (
    data: any[],
    setError?: (message: string) => void,
  ) => Promise<boolean>;
  existingNames?: string[]; // Lista de nombres ya existentes para validar duplicados
  validateUniqueNames?: boolean; // Si se deben validar los nombres como únicos
  children?: React.ReactNode; //para sesiones
  module?: 'sessions' | string;
  existingSessions?: {
    date: string;
    start_time: string;
    end_time: string;
    professional_id: string;
  }[];
  canContinue?: () => true | string; // <- esto permite retornar un error
}

export function BulkCreateDialog({
  open,
  onOpenChange,
  title = 'Carga Masiva de Datos',
  onParsedData,
  expectedExcelColumns,
  dbFieldNames,
  existingNames = [],
  validateUniqueNames = false,
  children,
  module = '',
  existingSessions = [],
  canContinue,
}: BulkCreateDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null); // Referencia al input de archivo oculto
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Archivo seleccionado
  const [error, setError] = useState<string | null>(null);
  const [showColumnErrorDialog, setShowColumnErrorDialog] = useState(false);
  const [columnErrorMessage, setColumnErrorMessage] = useState('');

  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setError(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [open]);

  const isValidXLSX = (file: File) => file.name.toLowerCase().endsWith('.xlsx'); // Verifica si el archivo es .xlsx

  const handleFile = (file: File) => {
    if (isValidXLSX(file)) {
      setSelectedFile(file); // Guardar archivo
      setError(null);
    } else {
      setError('Solo se permiten archivos con extensión .xlsx'); // Mostrar error si no es .xlsx
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file); // Llama al validador
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const mapDataWithColumns = (data: any[]) => {
    return data.map((item) => {
      const mappedObject: Record<string, any> = {};
      expectedExcelColumns.forEach((excelCol, idx) => {
        const dbCol = dbFieldNames[idx]; // Mapea columnas del Excel a campos de BD
        mappedObject[dbCol] = item[excelCol] ?? ''; // Si no existe el campo, se pone vacío
      });
      return mappedObject;
    });
  };

  const handleConfirm = () => {
    if (typeof canContinue === 'function') {
      const result = canContinue();
      if (result !== true) {
        setError(result); // Muestra el mensaje dentro del modal
        return; // Evita continuar
      }
    }

    if (!selectedFile) {
      setError('Debe seleccionar un archivo .xlsx antes de continuar');
      return;
    }

    const reader = new FileReader(); // Lector de archivos
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' }); // Leer Excel
        const sheetName = workbook.SheetNames[0]; // Primera hoja
        const worksheet = workbook.Sheets[sheetName];
        const headers = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        })[0] as string[];

        function normalizeText(text: string): string {
          return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); // Normaliza acentos
        }

        const normalizedHeaders = headers.map(normalizeText);
        const normalizedExpected = expectedExcelColumns.map(normalizeText);

        const headersAreValid =
          normalizedHeaders.length === normalizedExpected.length &&
          normalizedExpected.every((col) => normalizedHeaders.includes(col));

        if (!headersAreValid) {
          setColumnErrorMessage(
            `El archivo debe contener las siguientes columnas: ${expectedExcelColumns.join(', ')}`,
          );
          setShowColumnErrorDialog(true); // Mostrar modal de error por columnas inválidas
          return;
        }

        const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' }); // Leer todos los datos
        const finalData = mapDataWithColumns(rawData); // Convertir formato
        //definimos ya no es necesario pq lo definimos en bulkcreate
        //const existingSessions = props.existingSessions || [];
        function normalizeTime(value: any): string {
          if (value instanceof Date) {
            return value.toTimeString().slice(0, 5); // HH:MM
          } else if (typeof value === 'number') {
            // Excel time as fraction of 1 day
            const totalMinutes = Math.round(value * 24 * 60);
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return `${hours.toString().padStart(2, '0')}:${minutes
              .toString()
              .padStart(2, '0')}`;
          } else if (typeof value === 'string') {
            return value.slice(0, 5); // recorta a HH:MM
          }
          return '';
        }

        function normalizeDate(input: any): string {
          if (input instanceof Date) {
            return input.toISOString().split('T')[0];
          }
          if (typeof input === 'string') {
            if (input.includes('T')) return input.split('T')[0];
            if (input.includes('/')) {
              const [d, m, y] = input.split('/');
              return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }
            return input; // asume yyyy-mm-dd
          }
          return '';
        }
        //para sesiones  MODIFICADO A MODULE
        // Validar que la hora de fin sea mayor que la de inicio
        //const invalidHourRows: number[] = [];
        // para comunidades
        // Validar duplicados contra nombres existentes si se habilita
        const combinedErrors: string[] = [];

        if (module === 'sessions') {
          const invalidHourRows: number[] = [];
          const invalidCapacityRows: number[] = [];

          finalData.forEach((row, index) => {
            //adaptacion para que soporte formatos de fechas del excel

            const start = normalizeTime(row.start_time);
            const end = normalizeTime(row.end_time);

            const capacity = Number(row.capacity);

            const [h1, m1] = start?.split(':')?.map(Number) || [];
            const [h2, m2] = end?.split(':')?.map(Number) || [];

            const startMinutes = h1 * 60 + m1;
            const endMinutes = h2 * 60 + m2;

            if (isNaN(startMinutes) || isNaN(endMinutes)) {
              invalidHourRows.push(index + 2);
            } else if (endMinutes <= startMinutes) {
              invalidHourRows.push(index + 2);
            }

            if (isNaN(capacity) || capacity <= 0) {
              invalidCapacityRows.push(index + 2);
            }
          });

          if (invalidHourRows.length > 0) {
            combinedErrors.push(
              `Las siguientes filas tienen hora de fin menor o igual a la hora de inicio: ${invalidHourRows.join(', ')}`,
            );
          }

          if (invalidCapacityRows.length > 0) {
            combinedErrors.push(
              `Las siguientes filas tienen capacidad inválida (debe ser mayor a 0): ${invalidCapacityRows.join(', ')}`,
            );
          }
          // Sesiones cruces | Conflictos internos (entre filas del Excel)
          const getMinutes = (date: string, time: string) => {
            const [h, m] = time.split(':').map(Number);
            const d = new Date(date);
            d.setHours(h);
            d.setMinutes(m);
            return d.getTime();
          };

          const internalConflicts: string[] = [];

          for (let i = 0; i < finalData.length; i++) {
            const a = finalData[i];
            const aStart = getMinutes(a.date, normalizeTime(a.start_time));
            const aEnd = getMinutes(a.date, normalizeTime(a.end_time));

            for (let j = i + 1; j < finalData.length; j++) {
              const b = finalData[j];
              const bStart = getMinutes(b.date, normalizeTime(b.start_time));
              const bEnd = getMinutes(b.date, normalizeTime(b.end_time));

              const sameDate = a.date === b.date;
              const overlap =
                sameDate &&
                ((aStart >= bStart && aStart < bEnd) ||
                  (aEnd > bStart && aEnd <= bEnd) ||
                  (aStart <= bStart && aEnd >= bEnd));

              if (overlap) {
                internalConflicts.push(
                  `Conflicto interno de horarios entre fila ${i + 2} y ${j + 2}`,
                );
              }
            }
          }

          if (internalConflicts.length > 0) {
            combinedErrors.push(...internalConflicts);
          }

          // Sesiones cruces | Conflicto con sesiones ya registradas (requiere existingSessions prop)
          if (existingSessions?.length > 0) {
            const externalConflicts: string[] = [];
            const debugRows: string[] = [];

            finalData.forEach((row, index) => {
              const newStart = getMinutes(
                row.date,
                normalizeTime(row.start_time),
              );
              const newEnd = getMinutes(row.date, normalizeTime(row.end_time));

              const debugInfo: string[] = [`[Fila ${index + 2}]`];
              debugInfo.push(`Row date: ${row.date}`);
              debugInfo.push(
                `Start: ${normalizeTime(row.start_time)} → ${newStart}`,
              );
              debugInfo.push(`End: ${normalizeTime(row.end_time)} → ${newEnd}`);

              const overlap = existingSessions.some((session) => {
                const sessionStart = new Date(session.start_time).getTime();
                const sessionEnd = new Date(session.end_time).getTime();
                const sessionDate = session.date?.split('T')[0];

                const rowDate =
                  typeof row.date === 'string'
                    ? row.date.split('T')[0]
                    : new Date(row.date).toISOString().split('T')[0];

                debugInfo.push(`Comparando con sesión:`);
                debugInfo.push(`→ session.date: ${sessionDate}`);
                debugInfo.push(`→ sessionStart: ${sessionStart}`);
                debugInfo.push(`→ sessionEnd: ${sessionEnd}`);

                return (
                  rowDate === sessionDate &&
                  newStart < sessionEnd &&
                  newEnd > sessionStart
                );
              });

              if (overlap) {
                externalConflicts.push(
                  `Fila ${index + 2} se cruza con una sesión ya registrada`,
                );
              }

              debugRows.push(debugInfo.join('\n'));
            });

            // 🔍 Mostrar todo en el modal
            if (externalConflicts.length > 0) {
              combinedErrors.push(
                `🧠 Debug:\n${debugRows.join('\n\n')}\n\n🚨 Conflictos:\n${externalConflicts
                  .map((e) => `• ${e}`)
                  .join('\n')}`,
              );
            }
          }
        }
        if (combinedErrors.length > 0) {
          setError?.(combinedErrors.join('\n')); //  Esto muestra TODO en el modal
          return false; // <-- Frena acá
        }
        //validaciones de comunidades combinedErrors

        if (validateUniqueNames) {
          // 1. Validar duplicados internos del Excel
          const internalNameCounts = new Map<string, number>();
          finalData.forEach((row) => {
            const name = row.name?.toString().trim().toLowerCase();
            if (!name) return;
            internalNameCounts.set(
              name,
              (internalNameCounts.get(name) || 0) + 1,
            );
          });
          const internalDuplicates = Array.from(internalNameCounts.entries())
            .filter(([_, count]) => count > 1)
            .map(([name]) => name);

          if (internalDuplicates.length > 0) {
            combinedErrors.push(
              `El archivo contiene nombres de comunidad repetidos: ${internalDuplicates.join(', ')}`,
            );
          }

          // 2. Validar duplicados contra los nombres ya existentes
          const namesFromExcel = finalData.map((row) =>
            row.name?.toString().trim().toLowerCase(),
          );
          const existingLowerNames = existingNames.map((name) =>
            name.trim().toLowerCase(),
          );
          const conflicts = namesFromExcel.filter((name) =>
            existingLowerNames.includes(name),
          );
          if (conflicts.length > 0) {
            combinedErrors.push(
              `Ya existen comunidades con estos nombres: ${[...new Set(conflicts)].join(', ')}`,
            );
          }
        }

        // Validación de filas incompletas
        const invalidRowIndices: number[] = [];
        finalData.forEach((row, index) => {
          const isComplete = dbFieldNames.every((field) => {
            const value = row[field];
            return typeof value === 'string'
              ? value.trim() !== ''
              : Boolean(value);
          });
          if (!isComplete) {
            invalidRowIndices.push(index + 2); // +2 porque comienza en fila 2 (sin contar encabezado)
          }
        });

        if (invalidRowIndices.length > 0) {
          combinedErrors.push(
            `Las siguientes filas tienen campos incompletos: ${invalidRowIndices.join(', ')}`,
          );
        }

        // Si hay errores, mostrar todos juntos
        if (combinedErrors.length > 0) {
          setError(combinedErrors.join('\n')); // Mostrar todos los errores encontrados
          return;
        }
        //const success = await onParsedData(finalData, setError)
        const success = await onParsedData(finalData, (message) => {
          // Si ya hay error mostrado, combinamos ambos
          setError((prev) => (prev ? prev + '\n' + message : message));
        });
        if (success) {
          setSelectedFile(null);
          setError(null);
          onOpenChange(false); // ← Solo cierra si todo está OK
        }

        //solo los 4
        //await onParsedData(finalData, setError);
        //setSelectedFile(null);
        //setError(null);
        //onOpenChange(false);
        //onOpenChange(false);
      } catch (err) {
        //setError('Ocurrió un error inesperado procesando el archivo.');
        console.error('Detalles del error bulk:', err);
        setError(
          err.message || 'Ocurrió un error inesperado al crear las sesiones.',
        );
        //console.error(err);
      }
    };
    reader.readAsArrayBuffer(selectedFile); // Leer archivo como buffer
  };

  const handleDelete = () => {
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = ''; // Limpiar input oculto
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {children}

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

          <div
            onClick={() => inputRef.current?.click()}
            className="flex items-center justify-between border rounded px-4 py-2 w-full bg-white shadow-sm cursor-pointer hover:bg-gray-50 mt-4 transition"
          >
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Upload className="h-4 w-4 text-gray-500" />
              {selectedFile ? selectedFile.name : 'Seleccionar archivo .xlsx'}
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
