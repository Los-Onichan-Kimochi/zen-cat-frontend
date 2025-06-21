// src/routes/communities.tsx (This would be your route.tsx file)
import { useState } from 'react';
import { useNavigate,useLoaderData,createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { communitiesApi } from '@/api/communities/communities';

// Import the new components
import CommunitySearchBar from '@/components/communities-noauth/CommunitySearchBar';
import CommunityGrid from '@/components/communities-noauth/CommunityGrid';
import Pagination from '@/components/communities-noauth/Pagination';
import { Community } from '@/types/community'

// Define the route for '/communities'
export const Route = createFileRoute('/comunidades')({
  // *** LOADER DEFINITION ***
  // This is where you fetch your data from the API
  loader: async () => {
    try {
      const data: Community[] = await communitiesApi.getCommunities();  
      return { communities: data }; // Return the fetched data
    } catch (error) {
      console.error('Error fetching communities:', error);
      // In a real app, you might want to return an error object or throw a specific error
      throw new Error('Could not load communities. Please try again later.');
    }
  },
  component: CommunitiesPage,
});

function CommunitiesPage() {
// Access data from the loader. The `{}` is correct here.
  const { communities } = useLoaderData<typeof Route.loader>({});
  const navigate = useNavigate();

  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const communitiesPerPage = 6;

  const filteredCommunities = communities.filter(community => {
    // Add nullish coalescing or type guards if 'title' or 'description' could be optional
    const communityTitle = community.name || '';
    const communityDescription = community.purpose || '';
    return (
      communityTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      communityDescription.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }).sort((a, b) => {
    // Placeholder sorting logic
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCommunities.length / communitiesPerPage);
  const indexOfLastCommunity = currentPage * communitiesPerPage;
  const indexOfFirstCommunity = indexOfLastCommunity - communitiesPerPage;
  const currentCommunities = filteredCommunities.slice(indexOfFirstCommunity, indexOfLastCommunity);

  const handleGoBack = () => {
    navigate({ to: `/` });
  };

  const handleCardViewMore = (id: string) => {
    console.log(`Ver más for community ID: ${id}`);
    // Example: navigate to a detailed community page
    // navigate({ to: `/communities/${id}` });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-8">
      {/* Header Section */}
      <div className="w-full bg-white py-5 shadow-sm flex flex-col items-center">
        <div className="self-start ml-5 md:ml-10">
        <Button onClick={handleGoBack} className="text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white">
          &lt; Retroceder
        </Button>
        </div>
        <div className="text-center mt-5 px-4">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-3 sm:text-5xl">Explora nuestras comunidades</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed sm:text-xl">
            Conéctate con personas que comparten tus intereses y accede a servicios pensados para tu bienestar
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8">
        <CommunitySearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalResults={filteredCommunities.length}
        />

        <CommunityGrid
          communities={currentCommunities}
          onCardViewMore={handleCardViewMore}
        />

        {totalPages > 1 && ( // Only show pagination if there's more than one page
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>
    </div>
  );
}