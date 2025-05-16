import * as React from "react";
import SectionTitle from "./SectionTitle";
import Card from "./CardV2";

// Import images from Carrousel
import citaMedicaImage from "../../../images/Carrousel/image 151(3).png";
import citaNutricionalImage from "../../../images/Carrousel/image 151(4).png";

// Import Lucide Icons
import { Stethoscope, Apple } from "lucide-react";

const virtualServices = [
  {
    title: "Cita Médica",
    subtitle: "Acceder",
    imageUrl: citaMedicaImage,
    to: "/virtual/cita-medica",
    Icon: Stethoscope,
  },
  {
    title: "Cita Nutricional",
    subtitle: "Acceder",
    imageUrl: citaNutricionalImage,
    to: "/virtual/cita-nutricional",
    Icon: Apple,
  },
];

const VirtualServicesSection: React.FC = () => (
  <section className="max-w-7xl mx-auto px-6 py-12 bg-gray-50">
    <SectionTitle>Accede a servicios virtuales</SectionTitle>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {virtualServices.map((c) => (
        <Card 
          key={c.title} 
          title={c.title} 
          subtitle={c.subtitle} 
          imageUrl={c.imageUrl} 
          to={c.to} 
          Icon={c.Icon} 
        />
      ))}
    </div>
  </section>
);

export default VirtualServicesSection;
