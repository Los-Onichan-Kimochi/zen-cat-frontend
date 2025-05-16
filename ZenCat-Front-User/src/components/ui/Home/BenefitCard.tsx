import * as React from "react";

export interface BenefitCardProps {
  /** URL de la imagen de fondo (ej: `/cards/comunidades.jpg`) */
  imageUrl: string;
  /** Título del beneficio */
  title: string;
  /** Descripción breve */
  description: string;
  /** Icono SVG (p.ej. importado desde @heroicons o lucide-react) */
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const BenefitCard: React.FC<BenefitCardProps> = ({
  imageUrl,
  title,
  description,
  Icon,
}) => (
  <div className="relative group h-64 overflow-hidden rounded-2xl shadow-lg">
    {/* Imagen de fondo con zoom suave */}
    <img
      src={imageUrl}
      alt={title}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />

    {/* Overlay semitransparente */}
    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />

    {/* Contenido centrado */}
    <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
      <div className="bg-black/70 p-3 rounded-full mb-3">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-white">{description}</p>
    </div>
  </div>
);

export default BenefitCard;
