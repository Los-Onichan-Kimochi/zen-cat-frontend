import * as React from "react";
import { Link } from "@tanstack/react-router";

interface CardProps {
  title: string;
  imageUrl: string;
  to: string;
}

const Card: React.FC<CardProps> = ({ title, imageUrl, to }) => (
  <Link
    to={to}
    className="group relative block overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition"
  >
    <div className="h-64 w-full">
      <img
        src={imageUrl}
        alt={title}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
    </div>
    <div className="absolute bottom-4 left-4">
      <h3 className="text-xl font-semibold text-white mb-2 transition-transform duration-300 group-hover:-translate-y-1">
        {title}
      </h3>
      <span className="inline-block bg-black bg-opacity-60 text-white text-sm px-3 py-1 rounded-md transition-bg duration-300 group-hover:bg-opacity-80">
        Ver actividades disponibles
      </span>
    </div>
  </Link>
);

export default Card;
