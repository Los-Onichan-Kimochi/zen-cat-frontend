import { useState } from 'react';
import { SelectableCard } from '@/components/ui/selectable-card';

type Service = {
  title: string;
  description: string;
  imageUrl: string;
};

type Props = {
  services: Service[];
  onSelect: (title: string) => void;
  selected?: string | null;
};

const itemsPerPage = 3;

export function ServiceCarousel({ services, onSelect, selected }: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const pages = Math.ceil(services.length / itemsPerPage);

  const handleScroll = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  const handlePrev = () => {
    if (currentPage > 0) handleScroll(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < pages - 1) handleScroll(currentPage + 1);
  };

  return (
    <>
      {/* Contenedor visible */}
      <div className="overflow-hidden w-full flex justify-center">
        {/* Track de páginas */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentPage * 100}%)`,
            width: `${pages * 100}%`,
          }}
        >
          {Array.from({ length: pages }, (_, pageIndex) => (
            <div
              key={pageIndex}
              className="flex justify-center items-stretch min-w-full gap-6 px-1"
            >
              {services
                .slice(
                  pageIndex * itemsPerPage,
                  pageIndex * itemsPerPage + itemsPerPage,
                )
                .map((service) => (
                  <div key={service.title} className="w-[250px] shrink-0">
                    <SelectableCard
                      title={service.title}
                      description={service.description}
                      imageUrl={service.imageUrl}
                      selected={selected === service.title}
                      onClick={() => onSelect(service.title)}
                    />
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* Paginación */}
      <div className="flex justify-center gap-3 items-center text-sm pt-4">
        <button
          onClick={handlePrev}
          disabled={currentPage === 0}
          className="px-2 py-1 disabled:opacity-40"
        >
          &lt; Anterior
        </button>

        {Array.from({ length: pages }, (_, i) => (
          <button
            key={i}
            onClick={() => handleScroll(i)}
            className={`px-2 py-1 border rounded ${
              currentPage === i
                ? 'font-semibold border-gray-800'
                : 'text-gray-600'
            }`}
          >
            {i + 1}
          </button>
        ))}

        {pages > 3 && <span className="text-gray-400">…</span>}

        <button
          onClick={handleNext}
          disabled={currentPage === pages - 1}
          className="px-2 py-1 disabled:opacity-40"
        >
          Siguiente &gt;
        </button>
      </div>
    </>
  );
}
