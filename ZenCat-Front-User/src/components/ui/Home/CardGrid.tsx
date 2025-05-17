import * as React from "react";
import Card from "./Card";

import runnersImage from "../../../images/Home/image151(1).png";
import ciclistasImage from "../../../images/Home/image148.png";
import musicosImage from "../../../images/Home/image151.png";
import mamasImage from "../../../images/Home/image150.png";

export const CardGrid: React.FC = () => {
  const cards = [
    {
      title: "Runners",
      imageUrl: runnersImage, // Use imported image
      to: "/actividades/runners",
    },
    {
      title: "Ciclistas",
      imageUrl: ciclistasImage, // Use imported image
      to: "/actividades/ciclistas",
    },
    {
      title: "Músicos",
      imageUrl: musicosImage, // Use imported image
      to: "/actividades/musicos",
    },
    {
      title: "Mamás",
      imageUrl: mamasImage, // Use imported image
      to: "/actividades/mamas",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(({ title, imageUrl, to }) => (
          <Card key={title} title={title} imageUrl={imageUrl} to={to} />
        ))}
      </div>
    </section>
  );
};

export default CardGrid;
