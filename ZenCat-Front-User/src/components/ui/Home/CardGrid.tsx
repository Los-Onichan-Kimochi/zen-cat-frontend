import * as React from 'react';
import Card from './Card';
import { useEffect, useState } from 'react';
import { communitiesApi } from '@/api/communities/communities';
import { Community } from '@/types/community';

export const CardGrid: React.FC = () => {
  const [cards, setCards] = useState<
    { title: string; imageUrl: string; to: string; communityId: string }[]
  >([]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const data: Community[] = await communitiesApi.getCommunities();
        const cards = data.map((community) => ({
          title: community.name,
          imageUrl: community.image_url,
          to: `/comunidades/${community.id}`,
          communityId: community.id,
        }));
        setCards(cards);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };

    fetchCards();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(({ title, imageUrl, to, communityId }) => (
          <Card
            key={title}
            title={title}
            imageUrl={imageUrl}
            to={to}
            communityId={communityId}
          />
        ))}
      </div>
    </section>
  );
};

export default CardGrid;
