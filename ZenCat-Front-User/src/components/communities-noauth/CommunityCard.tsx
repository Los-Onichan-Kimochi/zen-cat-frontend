import React from 'react';
import { useNavigate, Link } from '@tanstack/react-router';

interface CommunityCardProps {
  communityId: string;
  imageUrl?: string; // Optional image URL
  title: string;
  description: string;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
  communityId,
  imageUrl,
  title,
  description,
}) => {
  const navigate = useNavigate();
  const handleViewMore = () => {
    navigate({ to: '/comunidades/$communityId', params: { communityId } });
  };
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col justify-between h-full">
      <div>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-32 object-cover rounded-md mb-4"
          />
        ) : (
          <div className="w-full h-32 bg-gray-200 rounded-md mb-4 flex items-center justify-center text-gray-500">
            {/* Placeholder for image */}
          </div>
        )}
        <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-4">{description}</p>
      </div>
      <Link
        to="/comunidades/$communityId"
        params={{ communityId }}
        className="mt-4 w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors block text-center"
      >
        Ver más
      </Link>
    </div>
  );
};

export default CommunityCard;
