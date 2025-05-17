import * as React from "react";
import BenefitCard from "./BenefitCard";
import {
  UsersIcon,
  CalendarIcon,
  BellIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";

// Import images from WhyUs directory
import comunidadImage from "../../../images/WhyUs/1.jpeg";
import reservarImage from "../../../images/WhyUs/2.jpeg";
import recordatoriosImage from "../../../images/WhyUs/3.jpg";
import historialImage from "../../../images/WhyUs/4.jpeg";

const benefits = [
  {
    imageUrl: comunidadImage,
    title: "Un solo perfil, múltiples comunidades",
    description:
      "Participa en actividades de distintos grupos sin cambiar de cuenta. Todo desde un mismo lugar.",
    Icon: UsersIcon,
  },
  {
    imageUrl: reservarImage,
    title: "Reserva fácil, sin complicaciones",
    description:
      "Elige el horario, haz clic y listo. Tus reservas están organizadas y bajo control.",
    Icon: CalendarIcon,
  },
  {
    imageUrl: recordatoriosImage,
    title: "Recordatorios automáticos",
    description:
      "Nunca más pierdas tu clase. Te avisamos cuando se acerca el evento.",
    Icon: BellIcon,
  },
  {
    imageUrl: historialImage,
    title: "Accede a tu historial siempre",
    description:
      "Revisa cuándo, dónde y con quién participaste. Todo queda guardado en tu perfil.",
    Icon: ClockIcon,
  },
];

const BenefitsSection: React.FC = () => (
  <section className="bg-gray-300 pb-16">
    {/* Encabezado */}
    <div className="max-w-4xl mx-auto px-6 text-center mb-12 py-5">
      <p className="text-sm font-medium uppercase text-gray-600 mb-2">
        Beneficios Destacados
      </p>
      <h2 className="text-6xl font-black text-gray-900 mb-4">
        ¿Por qué unirte a <u>Astrocat</u>?
      </h2>
      <p className="text-lg text-gray-700">
        Conecta con personas como tú. Organiza tu bienestar.  
        <br />Avanza a tu ritmo.
      </p>
    </div>

    {/* Grid de cards */}
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {benefits.map((b) => (
        <BenefitCard
          key={b.title}
          imageUrl={b.imageUrl}
          title={b.title}
          description={b.description}
          Icon={b.Icon}
        />
      ))}
    </div>
  </section>
);

export default BenefitsSection;
