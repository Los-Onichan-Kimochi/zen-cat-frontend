import React from 'react';
import { FaFilePdf } from 'react-icons/fa';
import { usePdfExport } from '@/hooks/use-pdf-export';

interface PDFTestButtonProps {
    elementRef: React.RefObject<HTMLElement | null>;
    disabled?: boolean;
}

export const PDFTestButton: React.FC<PDFTestButtonProps> = ({
    elementRef,
    disabled = false,
}) => {
    const { exportToPDF } = usePdfExport();

    const handleTestPDF = async () => {
        try {
            console.log('Iniciando generación de PDF...');
            console.log('Element ref:', elementRef.current);

            if (!elementRef.current) {
                console.error('Element ref is null');
                alert('Error: No se encontró el elemento para exportar');
                return;
            }

            await exportToPDF(elementRef.current, {
                filename: 'test_report.pdf',
                title: 'Test Report',
                subtitle: 'ZenCat Test',
                dateRange: 'Test Date Range',
            });

            console.log('PDF generado exitosamente');
        } catch (error) {
            console.error('Error en test PDF:', error);
            alert(`Error al generar PDF: ${error}`);
        }
    };

    return (
        <button
            className="px-6 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition font-semibold h-12 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleTestPDF}
            disabled={disabled}
        >
            <FaFilePdf size={20} /> Test PDF
        </button>
    );
}; 