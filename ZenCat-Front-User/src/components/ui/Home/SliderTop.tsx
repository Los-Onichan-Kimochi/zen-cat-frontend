import { Link } from "@tanstack/react-router";

export const Hero = () => {
  return (
    <section
      className="relative h-200 bg-cover bg-center flex items-center"
      style={{ backgroundImage: "url('/background-image-1.jpg')" }}
    >
      <div className="absolute inset-0 bg-opacity-50"></div>
      <div className="relative z-10 flex flex-col max-w-lg md:max-w-2xl px-6 md:px-12 text-left ml-auto sm:mr-8 md:mr-16 lg:mr-62">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white mb-4">
          Encuentra tu <u>espacio</u>,<br /> mejora tu ritmo
        </h1>
        <p className="text-base md:text-lg text-white mb-6">
          La plataforma donde accedes a bienestar, actividades y comunidad desde un solo perfil.
          <br />
          Yoga, entrenamientos, servicios médicos y más… elige cómo cuidarte
        </p>
        <Link
          to="/signup"
          className="inline-block bg-black text-white text-center font-black px-6 py-3 rounded-md hover:bg-white hover:text-black transition duration-300 ease-in-out mb-4"
        >
          Comienza ahora →
        </Link>
        <p className="text-sm font-bold text-gray-300">
          Nominado a soluciones de bienestar 2025
        </p>
      </div>
    </section>
  );
};
