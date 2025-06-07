import React from 'react';

export const ServiceStep: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Título */}
      <h3 className="text-xl font-semibold text-center">
        ¡Busca el servicio que más te guste!
      </h3>

      {/* Barra de búsqueda + Ordenamiento */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <input
          type="text"
          placeholder="Buscar servicio ..."
          className="w-full md:w-1/2 border border-gray-300 rounded-md px-4 py-2"
        />
        <select className="w-full md:w-1/4 border border-gray-300 rounded-md px-4 py-2">
          <option>Ordenar por</option>
          <option value="a-z">A-Z</option>
          <option value="z-a">Z-A</option>
        </select>
      </div>

      {/* Result count */}
      <p className="text-sm text-muted-foreground">Resultados: 10 servicios</p>

      {/* Grid de servicios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Card de servicio (simulada) */}
        <ServiceCard
          title="Lactario"
          description="Área privada y cómoda para que las mamás puedan amamantar o extraer leche materna en un entorno higiénico y tranquilo."
        />
        <ServiceCard
          title="Cita médica"
          description="Atención personalizada con profesionales de la salud para consultas, diagnósticos y tratamientos. Agenda tu cita y cuida de tu bienestar."
        />
        <ServiceCard
          title="Yoga"
          description="Clases para practicar posturas, respiración y meditación. Mejora tu flexibilidad, reduce el estrés y encuentra equilibrio físico y mental."
        />
      </div>

      {/* Paginación simple */}
      <div className="flex justify-center gap-2 items-center text-sm pt-2">
        <button className="px-2 py-1">&lt; Anterior</button>
        <span className="font-semibold px-2">1</span>
        <span>2</span>
        <span>3</span>
        <span>…</span>
        <button className="px-2 py-1">Siguiente &gt;</button>
      </div>
    </div>
  );
};

// Componente auxiliar para una tarjeta de servicio
const ServiceCard = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="border p-4 rounded-md bg-white hover:shadow-md transition-all">
    <h4 className="font-semibold mb-2">{title}</h4>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);
