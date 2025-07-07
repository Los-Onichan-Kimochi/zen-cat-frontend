import React from 'react';
import { FaDownload, FaFilePdf } from 'react-icons/fa';

interface ExportButtonsProps {
    onExportCSV: () => void;
    onExportPDF?: () => void;
    disabled?: boolean;
    loading?: boolean;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
    onExportCSV,
    onExportPDF,
    disabled = false,
    loading = false,
}) => {
    return (
        <>
            {/* Botón CSV */}
            <button
                className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg shadow-md hover:bg-zinc-700 transition font-semibold h-9 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                onClick={onExportCSV}
                disabled={disabled || loading}
            >
                <FaDownload size={16} /> Exportar CSV
            </button>

            {/* Botón PDF */}
            <button
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition font-semibold h-9 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                onClick={onExportPDF}
                disabled={disabled || loading}
            >
                <FaFilePdf size={16} /> Exportar PDF
            </button>
        </>
    );
}; 