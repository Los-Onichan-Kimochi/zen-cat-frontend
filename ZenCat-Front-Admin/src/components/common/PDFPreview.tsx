import React from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface PDFPreviewProps {
    children: React.ReactNode;
    onTogglePreview: (isPreview: boolean) => void;
    isPreview: boolean;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({
    children,
    onTogglePreview,
    isPreview,
}) => {
    return (
        <div className="relative">
            {/* Botón de previsualización */}
            <button
                onClick={() => onTogglePreview(!isPreview)}
                className="fixed top-4 right-4 z-50 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition font-semibold flex items-center gap-2"
            >
                {isPreview ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                {isPreview ? 'Ocultar Vista PDF' : 'Vista PDF'}
            </button>

            {/* Contenedor con estilos de PDF */}
            <div
                className={`transition-all duration-300 ${isPreview
                        ? 'bg-white shadow-lg mx-auto max-w-[210mm] min-h-[297mm] p-8'
                        : ''
                    }`}
            >
                {children}
            </div>

            {/* Overlay de información en modo preview */}
            {isPreview && (
                <div className="fixed bottom-4 left-4 z-50 bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg text-sm">
                    Vista previa del PDF - Tamaño A4
                </div>
            )}
        </div>
    );
}; 