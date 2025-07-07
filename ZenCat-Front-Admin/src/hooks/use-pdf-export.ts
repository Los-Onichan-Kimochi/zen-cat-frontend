import { useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFExportOptions {
    filename?: string;
    title?: string;
    subtitle?: string;
    dateRange?: string;
}

export const usePdfExport = () => {
    const exportToPDF = useCallback(
        async (
            elementRef: HTMLElement | null,
            options: PDFExportOptions = {}
        ) => {
            if (!elementRef) {
                alert('No se encontró el contenido para exportar.');
                return;
            }
            try {
                // Oculta los elementos con data-pdf-hide
                const elementsToHide = elementRef.querySelectorAll('[data-pdf-hide]');
                const originalDisplays: string[] = [];
                elementsToHide.forEach((el) => {
                    originalDisplays.push((el as HTMLElement).style.display);
                    (el as HTMLElement).style.display = 'none';
                });

                // Espera un frame para asegurar el reflow
                await new Promise((res) => setTimeout(res, 50));

                // Captura el dashboard
                const canvas = await html2canvas(elementRef, {
                    scale: 1, // Menos memoria, más compatibilidad
                    useCORS: true,
                    backgroundColor: '#fff',
                });

                // Restaura los elementos ocultos
                elementsToHide.forEach((el, i) => {
                    (el as HTMLElement).style.display = originalDisplays[i];
                });

                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4',
                });

                // Calcula el tamaño de la imagen en el PDF
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgProps = {
                    width: canvas.width,
                    height: canvas.height,
                };
                const ratio = Math.min(pdfWidth / imgProps.width, (pdfHeight - 20) / imgProps.height);
                const imgWidth = imgProps.width * ratio;
                const imgHeight = imgProps.height * ratio;

                // Opcional: agrega título
                let y = 10;
                if (options.title) {
                    pdf.setFontSize(18);
                    pdf.text(options.title, 10, y);
                    y += 10;
                }
                if (options.subtitle) {
                    pdf.setFontSize(12);
                    pdf.text(options.subtitle, 10, y);
                    y += 8;
                }
                if (options.dateRange) {
                    pdf.setFontSize(10);
                    pdf.text(options.dateRange, 10, y);
                    y += 8;
                }

                // Dibuja la imagen
                pdf.addImage(imgData, 'PNG', 10, y, imgWidth, imgHeight);

                pdf.save(options.filename || 'reporte.pdf');
            } catch (error: any) {
                // Muestra el error real en consola y alerta
                console.error('Error al generar PDF:', error, error?.message, error?.stack);
                alert('Error al generar el PDF. Detalles en consola.');
            }
        },
        []
    );

    return { exportToPDF };
}; 