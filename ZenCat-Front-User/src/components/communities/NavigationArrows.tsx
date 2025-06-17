import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'

interface NavigationArrowsProps {
    onPrevious: () => void
    onNext: () => void
    canGoPrevious: boolean
    canGoNext: boolean
    className?: string
}

export function NavigationArrows({
    onPrevious,
    onNext,
    canGoPrevious,
    canGoNext,
    className
}: NavigationArrowsProps) {
    return (
        <div className={cn("flex items-center justify-between", className)}>
            <button
                onClick={onPrevious}
                disabled={!canGoPrevious}
                className={cn(
                    "p-3 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                )}
                aria-label="Anterior"
            >
                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>

            <button
                onClick={onNext}
                disabled={!canGoNext}
                className={cn(
                    "p-3 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                )}
                aria-label="Siguiente"
            >
                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
        </div>
    )
}
