import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  SearchInput,
  FilterControls,
  CommunitiesGrid,
  InformationCommunity
} from '@/components/communities';
import { useUserCommunities } from '@/api/users/user-communities';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export const Route = createFileRoute('/comunidades')({
  component: ComunidadesComponent,
});

function ComunidadesComponent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [filterBy, setFilterBy] = useState('all')

  // Obtener el usuario del contexto de autenticación (igual que en perfil.tsx)
  const { user } = useAuth();

  // Fetch user communities usando el ID del usuario autenticado
  const { communities, loading, error } = useUserCommunities(user?.id);

  // Si hay error al cargar las comunidades
  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white relative flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error al cargar las comunidades</p>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Si está cargando las comunidades
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white relative flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando comunidades...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
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
                communities={communities}
                searchTerm={searchTerm}
                sortBy={sortBy}
                filterBy={filterBy}
                itemsPerPage={4}
              />
            </div>

            {/* Information Community Box */}
            <div className="mt-8 px-12">
              <InformationCommunity />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
