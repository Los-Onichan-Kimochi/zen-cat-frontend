import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
}: TablePaginationProps) {
  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex justify-center mt-6">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <button
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              className="px-2 py-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
            >
              Anterior
            </button>
          </PaginationItem>

          {Array.from({ length: totalPages }).map((_, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(index);
                }}
                isActive={currentPage === index}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className="px-2 py-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
            >
              Siguiente
            </button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
} 