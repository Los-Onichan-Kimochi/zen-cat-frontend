import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  SearchInput,
  FilterControls,
  CommunitiesGrid
} from '@/components/communities';
import { mockCommunities } from '@/data/mock-communities';

export const Route = createFileRoute('/comunidades')({
  component: ComunidadesComponent,
});

function ComunidadesComponent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [filterBy, setFilterBy] = useState('all')

  return (
    <div className="min-h-screen bg-white relative">
      {/* Header with TopBar space */}
      <div className="pt-6">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-black mb-4">
              Mis comunidades
            </h1>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar comunidad..."
                className="w-full sm:w-80"
              />
              <FilterControls
                sortBy={sortBy}
                filterBy={filterBy}
                onSortChange={setSortBy}
                onFilterChange={setFilterBy}
              />
            </div>
          </div>

          {/* Communities Grid Container */}
          <div className="relative px-12">
            <CommunitiesGrid
              communities={mockCommunities}
              searchTerm={searchTerm}
              sortBy={sortBy}
              filterBy={filterBy}
              itemsPerPage={4}
            />
          </div>
        </div>
      </div>

      {/* Background Image with ico-astrocat.svg */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none">
        <div className="relative h-96 flex items-center justify-center">
          {/* Blurred background effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-100/50 to-transparent"></div>

          {/* AstroCat SVG with blur effect */}
          <div className="relative z-10 opacity-30">
            <img
              src="/ico-astrocat.svg"
              alt="AstroCat"
              className="w-64 h-64 object-contain filter blur-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
