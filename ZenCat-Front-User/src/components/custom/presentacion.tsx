import Comunidades from '../../assets/comunidades.jpg';

const Presentacion = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden rounded-md">
      <div className="flex h-full">
        <div className="w-1/2 bg-gray-100 flex items-center justify-center">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Encuentra tu espacio,<br />mejora tu ritmo
            </h2>
            <p className="text-gray-700 mb-4">
              La plataforma donde accedes a bienestar<br />
              y comunidad desde un solo perfil.<br />
              Yoga, servicios médicos y más...<br />
              elige cómo cuidarte
            </p>
            <button className="bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400">
              Ver comunidades
            </button>
          </div>
        </div>
        <div className="w-1/2 relative">
          <img
            src={Comunidades}
            alt="Descripción de la imagen"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute top-0 left-0 w-0 h-0 border-t-[50vh] border-l-[50vh] border-t-white border-l-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default Presentacion;