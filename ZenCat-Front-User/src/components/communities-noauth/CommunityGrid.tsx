import React from 'react';
import CommunityCard from './CommunityCard';

interface CommunityItem {
  id: string; // Unique ID for key prop
  image_url?: string;
  name: string;
  purpose: string;
}

interface CommunityGridProps {
  communities: CommunityItem[];
  onCardViewMore: (id: string) => void;
}

const CommunityGrid: React.FC<CommunityGridProps> = ({
  communities,
  onCardViewMore,
}) => {
  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.map((community) => (
          <CommunityCard
            key={community.id}
            imageUrl={community.image_url}
            title={community.name}
            description={community.purpose}
            onViewMore={() => onCardViewMore(community.id)}
          />
        ))}
      </div>
    </section>
  );
};

export default CommunityGrid;
