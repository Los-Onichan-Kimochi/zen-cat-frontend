import * as React from "react";
import SectionTitle from "./SectionTitle";
import Card from "./CardV2";

// Import images from Carrousel
import gimnasioImage from "../../../images/Carrousel/image 148(1).png";
import yogaImage from "../../../images/Carrousel/image 150(1).png";
import funcionalImage from "../../../images/Carrousel/image 151(2).png";

// Import Lucide Icons
import { Dumbbell, Sparkles, Activity } from "lucide-react";

const activities = [
  {
    title: "Gimnasio",
    subtitle: "Disponible en varias comunidades",
    imageUrl: gimnasioImage,
    to: "/reserva/gimnasio",
    Icon: Dumbbell,
  },
  {
    title: "Yoga",
    subtitle: "Explora desde tu perfil",
    imageUrl: yogaImage,
    to: "/reserva/yoga",
    Icon: Sparkles,
  },
  {
    title: "Funcional",
    subtitle: "Consulta disponibilidad",
    imageUrl: funcionalImage,
    to: "/reserva/funcional",
    Icon: Activity,
  },
];

const ActivitiesSection: React.FC = () => (
  <section className="max-w-7xl mx-auto px-6 pb-12 bg-gray-50">
    <SectionTitle>Reserva Actividades</SectionTitle>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {activities.map((c) => (
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

export default ActivitiesSection;
