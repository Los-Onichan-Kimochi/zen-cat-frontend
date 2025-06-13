import { Select, SelectItem } from '@/components/ui/select'

interface FilterControlsProps {
    sortBy: string
    filterBy: string
    onSortChange: (value: string) => void
    onFilterChange: (value: string) => void
}

export function FilterControls({ sortBy, filterBy, onSortChange, onFilterChange }: FilterControlsProps) {
    return (
        <div className="flex gap-4">
            <div className="w-48">
                <Select value={sortBy} onValueChange={onSortChange} placeholder="Ordenar por">
                    <SelectItem value="name">Nombre</SelectItem>
                    <SelectItem value="status">Estado</SelectItem>
                    <SelectItem value="date">Fecha</SelectItem>
                </Select>
            </div>

            <div className="w-48">
                <Select value={filterBy} onValueChange={onFilterChange} placeholder="Filtrar por">
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="active">Activas</SelectItem>
                    <SelectItem value="suspended">Suspendidas</SelectItem>
                    <SelectItem value="expired">Vencidas</SelectItem>
                </Select>
            </div>
        </div>
    )
}
