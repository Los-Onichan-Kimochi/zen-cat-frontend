import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/context/AuthContext';

interface CardProps {
  title: string;
  imageUrl: string;
  to: string;
  communityId?: string;
}

const Card: React.FC<CardProps> = ({ title, imageUrl, to, communityId }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (isAuthenticated) {
      // Usuario autenticado → ir a onboarding/membresía con la comunidad seleccionada
      navigate({
        to: '/onboarding/membresia',
        search: communityId ? { communityId } : undefined,
      });
    } else {
      // Usuario no autenticado → ir a login
      navigate({ to: '/login' });
    }
  };

  return (
    <a
      href={to}
      onClick={handleCardClick}
      className="group relative block overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition cursor-pointer"
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
          {isAuthenticated
            ? 'Elegir membresía'
            : 'Iniciar para ver actividades'}
        </span>
      </div>
    </a>
  );
};

export default Card;
