import React, { useRef } from 'react';
import { FaDownload, FaFilePdf } from 'react-icons/fa';
import { usePdfExport } from '@/hooks/use-pdf-export';

interface ExportButtonsProps {
    onExportCSV: () => void;
    pdfElementRef: React.RefObject<HTMLElement | null>;
    pdfOptions: {
        filename?: string;
        title?: string;
        subtitle?: string;
        dateRange?: string;
    };
    disabled?: boolean;
    loading?: boolean;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
    onExportCSV,
    pdfElementRef,
    pdfOptions,
    disabled = false,
    loading = false,
}) => {
    const { exportToPDF } = usePdfExport();

    const handleExportPDF = async () => {
        if (pdfElementRef.current) {
            await exportToPDF(pdfElementRef.current, pdfOptions);
        }
    };

    return (
        <>
            {/* Botón CSV */}
            <button
                className="px-6 py-2 bg-zinc-900 text-white rounded-lg shadow-md hover:bg-zinc-700 transition font-semibold h-12 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onExportCSV}
                disabled={disabled || loading}
            >
                <FaDownload size={20} /> Exportar CSV
            </button>

            {/* Botón PDF */}
            <button
                className="px-6 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition font-semibold h-12 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleExportPDF}
                disabled={disabled || loading}
            >
                <FaFilePdf size={20} /> Exportar PDF
            </button>
        </>
    );
}; 