// CallToActionSection.tsx
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

const CallToActionSection: React.FC = () => {
  return (
    <section className="bg-gray-900 py-26">
      <div className="max-w-2xl mx-auto px-6 text-center">
        {/* Subtítulo pequeño */}
        <p className="uppercase text-sm text-gray-400 mb-2">
          Comienza hoy
        </p>
        {/* Título principal */}
        <h2 className="text-6xl font-black text-white mb-4">
            Unete a <u>Astrocat</u> hoy
        </h2>
        {/* Texto descriptivo */}
        <p className="text-lg text-gray-200 mb-8 leading-relaxed">
          Da el primer paso para mejorar tu bienestar.  
        </p>
        {/* Botón CTA */}
        <Link to="/signup">
          <Button className="bg-white text-black hover:bg-gray-100 transition">
            Comienza ahora
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default CallToActionSection;
