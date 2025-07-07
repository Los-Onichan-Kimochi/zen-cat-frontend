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
                console.error('Element reference is required for PDF export');
                return;
            }

            try {
                // Mostrar indicador de carga (opcional)
                const loadingElement = document.createElement('div');
                loadingElement.innerHTML = 'Generando PDF...';
                loadingElement.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 20px;
          border-radius: 8px;
          z-index: 9999;
        `;
                document.body.appendChild(loadingElement);

                // Ocultar elementos que no queremos en el PDF
                const elementsToHide = elementRef.querySelectorAll('[data-pdf-hide]');
                const originalDisplays: string[] = [];

                elementsToHide.forEach((el) => {
                    originalDisplays.push((el as HTMLElement).style.display);
                    (el as HTMLElement).style.display = 'none';
                });

                // Capturar el elemento como imagen
                const canvas = await html2canvas(elementRef, {
                    scale: 2, // Mejor calidad
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    width: elementRef.scrollWidth,
                    height: elementRef.scrollHeight,
                });

                // Restaurar elementos ocultos
                elementsToHide.forEach((el, index) => {
                    (el as HTMLElement).style.display = originalDisplays[index];
                });

                // Crear PDF
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4',
                });

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = pdfWidth - 20; // Margen de 10mm en cada lado
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                // Agregar título y metadatos si se proporcionan
                if (options.title) {
                    pdf.setFontSize(18);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(options.title, 10, 20);

                    if (options.subtitle) {
                        pdf.setFontSize(12);
                        pdf.setFont('helvetica', 'normal');
                        pdf.text(options.subtitle, 10, 30);
                    }

                    if (options.dateRange) {
                        pdf.setFontSize(10);
                        pdf.setFont('helvetica', 'italic');
                        pdf.text(options.dateRange, 10, 40);
                    }
                }

                // Calcular posición inicial de la imagen
                let yPosition = options.title ? 50 : 10;

                // Agregar imagen al PDF
                if (imgHeight <= pdfHeight - yPosition) {
                    // La imagen cabe en una página
                    pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
                } else {
                    // La imagen necesita múltiples páginas
                    let remainingHeight = imgHeight;
                    let currentY = yPosition;

                    while (remainingHeight > 0) {
                        const pageHeight = pdfHeight - currentY;
                        const heightToAdd = Math.min(remainingHeight, pageHeight);

                        pdf.addImage(
                            imgData,
                            'PNG',
                            10,
                            currentY,
                            imgWidth,
                            imgHeight,
                            '',
                            'FAST',
                            0,
                            (imgHeight - remainingHeight) / imgHeight
                        );

                        remainingHeight -= pageHeight;

                        if (remainingHeight > 0) {
                            pdf.addPage();
                            currentY = 10;
                        }
                    }
                }

                // Guardar PDF
                const filename = options.filename || `reporte_${new Date().toISOString().split('T')[0]}.pdf`;
                pdf.save(filename);

                // Remover indicador de carga
                document.body.removeChild(loadingElement);
            } catch (error) {
                console.error('Error generating PDF:', error);
                alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
            }
        },
        []
    );

    return { exportToPDF };
}; 