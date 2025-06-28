import React from 'react';
import { Search } from 'lucide-react'; // Assuming you might want a search icon inside the input

interface CommunitySearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalResults: number;
}

const CommunitySearchBar: React.FC<CommunitySearchBarProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  totalResults,
}) => {
  return (
    <section className="mb-8 px-4">
      {' '}
      {/* Added px-4 for padding consistent with parent */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        ¡Busca la comunidad que más te guste!
      </h2>
      <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar comunidad..."
            className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <select
          className="p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-auto"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="">Ordenar por</option>
          <option value="recent">Más reciente</option>
          <option value="popular">Más popular</option>
          {/* Add more sorting options as needed */}
        </select>
      </div>
      <p className="text-sm text-gray-500 mt-2 text-center">
        Resultados: {totalResults} comunidades
      </p>
    </section>
  );
};

export default CommunitySearchBar;
