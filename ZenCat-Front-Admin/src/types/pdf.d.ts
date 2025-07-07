declare module 'jspdf' {
    export default class jsPDF {
        constructor(options?: {
            orientation?: 'portrait' | 'landscape';
            unit?: 'pt' | 'mm' | 'cm' | 'in';
            format?: string | number[];
        });

        internal: {
            pageSize: {
                getWidth(): number;
                getHeight(): number;
            };
        };

        setFontSize(size: number): void;
        setFont(fontName: string, fontStyle?: string): void;
        text(text: string, x: number, y: number): void;
        addImage(
            imageData: string,
            format: string,
            x: number,
            y: number,
            width: number,
            height: number,
            alias?: string,
            compression?: string,
            rotation?: number,
            clipX?: number
        ): void;
        addPage(): void;
        save(filename: string): void;
    }
}

declare module 'html2canvas' {
    interface Html2CanvasOptions {
        scale?: number;
        useCORS?: boolean;
        allowTaint?: boolean;
        backgroundColor?: string;
        width?: number;
        height?: number;
    }

    function html2canvas(
        element: HTMLElement,
        options?: Html2CanvasOptions
    ): Promise<HTMLCanvasElement>;

    export default html2canvas;
} 