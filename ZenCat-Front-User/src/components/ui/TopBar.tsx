import { Link } from '@tanstack/react-router';
import { PersonIcon, ExitIcon } from '@radix-ui/react-icons';
import { useAuth } from '@/context/AuthContext'; // importa tu hook
import { HomeComponent } from '@/routes/home/route';
import HowItWorks from '../../components/ui/Home/HowItWorks';
export const TopBar = () => {
  const { user, logout } = useAuth();
  return (
    <nav className="bg-black text-white h-16 flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" hash="top" className="flex items-center hover:opacity-80">
        <img
          src="/ico-astrozen.svg"
          alt="Astrocat logo"
          className="h-14 w-auto mr-3"
        />
        <span className="text-2xl font-bold tracking-wide">ASTROCAT</span>
      </Link>

      {/* Menú principal */}
      <div className="hidden md:flex space-x-8">
        <Link to="/" hash="como-funciona" className="hover:opacity-80 hover:font-black transition-all duration-300 ease-in-out">
          ¿Cómo funciona?
        </Link>
        <Link to="/" hash="comunidades" className="hover:opacity-80 hover:font-black transition-all duration-300 ease-in-out">
          Comunidades
        </Link>
        {/*<Link to="/" className="hover:opacity-80 hover:font-black transition-all duration-300 ease-in-out">
          Precios
        </Link>*/}
        <Link to="/" hash="membresia" className="hover:opacity-80 hover:font-black transition-all duration-300 ease-in-out">
          Membresía
        </Link>
        <Link to="/contacto" className="hover:opacity-80 hover:font-black transition-all duration-300 ease-in-out">
          Contacto
        </Link>
      </div>

      {/* Acciones (login / signup) o info usuario */}
      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-3">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="Avatar"
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <PersonIcon className="h-8 w-8 text-white rounded-full bg-gray-500 p-1" />
            )}
            <span className="hidden sm:block">{user.name || user.email}</span>
            <button
              onClick={logout}
              className="p-2 rounded-full hover:bg-white hover:text-black transition"
              aria-label="Cerrar sesión"
            >
              <ExitIcon className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <>
            <Link
              to="/login"
              className="flex items-center px-4 py-2 border border-white rounded-full hover:bg-white hover:text-black transition"
            >
              <PersonIcon className="mr-2 h-5 w-5" />
              Iniciar sesión
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition"
            >
              Comienza ahora
            </Link>
          </>
        )}
      </div>

      {/* botón hamburguesa para móvil */}
      <button className="md:hidden focus:outline-none">
        {/* aquí podrías poner un icono de menú */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>
    </nav>
  );
};