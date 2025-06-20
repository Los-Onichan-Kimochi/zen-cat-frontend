import { useState, useMemo } from 'react'
import { CommunityCard, Community } from './CommunityCard'
import { CommunityPlaceholder } from './CommunityPlaceholder'
import { NavigationArrows } from './NavigationArrows'

interface CommunitiesGridProps {
    communities: Community[]
    searchTerm: string
    sortBy: string
    filterBy: string
    itemsPerPage?: number
    selectCommunity: (communityId: string) => void
}

export function CommunitiesGrid({
    communities,
    searchTerm,
    sortBy,
    filterBy,
    itemsPerPage = 4,
    selectCommunity
}: CommunitiesGridProps) {
    const [currentPage, setCurrentPage] = useState(0)

    // Filtrar y buscar comunidades
    const filteredCommunities = useMemo(() => {
        let filtered = [...communities]

        // Aplicar filtro de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(community =>
                community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                community.type.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Aplicar filtro por estado
        if (filterBy && filterBy !== 'all') {
            filtered = filtered.filter(community => community.status === filterBy)
        }

        // Aplicar ordenamiento
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name)
                case 'status':
                    return a.status.localeCompare(b.status)
                case 'date':
                    // Ordenar por ID como proxy de fecha (asumiendo IDs cronológicos)
                    return a.id.localeCompare(b.id)
                default:
                    return 0
            }
        })

        return filtered
    }, [communities, searchTerm, filterBy, sortBy])

    // Paginación
    const totalPages = Math.ceil(filteredCommunities.length / itemsPerPage)
    const startIndex = currentPage * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentCommunities = filteredCommunities.slice(startIndex, endIndex)

    const canGoPrevious = currentPage > 0
    const canGoNext = currentPage < totalPages - 1

    const handlePrevious = () => {
        if (canGoPrevious) {
            setCurrentPage(currentPage - 1)
        }
    }

    const handleNext = () => {
        if (canGoNext) {
            setCurrentPage(currentPage + 1)
        }
    }

    const handleCommunityAction = (_communityId: string, _action: string) => {
        // Aquí puedes implementar la lógica específica para cada acción
        console.log("Función más general")
        if (_action === "active"){//When the membership is active
            selectCommunity(_communityId);
        }else if (_action === "suspended"){//When the membership is suspended

        }else {//When the membership is expired

        }
    }

    // Reset página cuando cambian los filtros
    useMemo(() => {
        setCurrentPage(0)
    }, [searchTerm, sortBy, filterBy])

    if (filteredCommunities.length === 0) {
        const message = searchTerm
            ? `No se encontraron comunidades que coincidan con "${searchTerm}"`
            : filterBy && filterBy !== 'all'
                ? `No tienes comunidades con estado "${filterBy}"`
                : "No tienes comunidades todavía"

        return <CommunityPlaceholder message={message} />
    }

    return (
        <div className="space-y-8">
            {/* Flechas de navegación y grid */}
            <div className="relative">
                {/* Solo mostrar flechas si hay más de una página */}
                {totalPages > 1 && (
                    <NavigationArrows
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                        canGoPrevious={canGoPrevious}
                        canGoNext={canGoNext}
                        className="absolute -left-16 -right-16 top-1/2 -translate-y-1/2 z-10"
                    />
                )}

                {/* Grid de comunidades adaptivo */}
                <div className={`flex flex-wrap justify-center gap-6 ${currentCommunities.length === 1
                        ? '' // Una comunidad centrada
                        : currentCommunities.length === 2
                            ? 'max-w-xl mx-auto' // Dos comunidades
                            : currentCommunities.length === 3
                                ? 'max-w-4xl mx-auto' // Tres comunidades  
                                : 'max-w-6xl mx-auto' // Cuatro comunidades
                    }`}>
                    {currentCommunities.map((community) => (
                        <CommunityCard
                            key={community.id}
                            community={community}
                            onAction={handleCommunityAction}
                        />
                    ))}
                </div>
            </div>

            {/* Información de paginación */}
            {totalPages > 1 && (
                <div className="text-center text-sm text-gray-500">
                    Página {currentPage + 1} de {totalPages} •
                    Mostrando {currentCommunities.length} de {filteredCommunities.length} comunidades
                </div>
            )}
        </div>
    )
}
