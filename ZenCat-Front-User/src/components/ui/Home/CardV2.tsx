import * as React from "react";
import { Link } from "@tanstack/react-router";

export interface CardProps {
  /** Texto principal (p. ej. "Yoga") */
  title: string;
  /** Texto secundario (p. ej. "Explora desde tu perfil") */
  subtitle: string;
  /** URL de la imagen de fondo */
  imageUrl: string;
  /** Ruta a la que enlaza la card */
  to: string;
  /** Componente SVG para el icono */
  Icon: React.ElementType;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  imageUrl,
  to,
  Icon,
}) => (
  <Link
    to={to}
    className="group relative block h-52 overflow-hidden rounded-2xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1"
  >
    {/* Imagen de fondo */}
    <img
      src={imageUrl}
      alt={title}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />

    {/* Overlay degradado de abajo hacia arriba */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

    {/* Contenido */}
    <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
      <Icon className="h-12 w-12 mb-2 text-white" />
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-white">{subtitle}</p>
    </div>
  </Link>
);

export default Card;
