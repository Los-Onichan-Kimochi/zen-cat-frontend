import { Link } from '@tanstack/react-router';
import {
  PersonIcon,
  ExitIcon,
  CalendarIcon,
  ChevronDownIcon,
} from '@radix-ui/react-icons';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
        <Link
          to="/comunidades"
          className="hover:opacity-80 hover:font-black transition-all duration-300 ease-in-out"
        >
          Comunidades
        </Link>

        <Link
          to="/"
          hash="como-funciona"
          className="hover:opacity-80 hover:font-black transition-all duration-300 ease-in-out"
        >
          ¿Cómo funciona?
        </Link>

        <Link
          to="/"
          hash="membresia"
          className="hover:opacity-80 hover:font-black transition-all duration-300 ease-in-out"
        >
          Membresía
        </Link>
        <Link
          to="/"
          hash="contacto"
          className="hover:opacity-80 hover:font-black transition-all duration-300 ease-in-out"
        >
          Contacto
        </Link>
      </div>

      {/* Acciones (login / signup) o info usuario */}
      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-3">
            {/* Dropdown de usuario para desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-gray-800 transition focus:outline-none">
                  {user.image_url || user.imageUrl ? (
                    <img
                      src={user.image_url || user.imageUrl}
                      alt="Avatar"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <PersonIcon className="h-6 w-6 text-white" />
                  )}
                  <span className="text-sm">{user.name || user.email}</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link
                    to="/perfil"
                    className="flex items-center cursor-pointer"
                  >
                    <PersonIcon className="mr-2 h-4 w-4" />
                    Mi Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/mis-comunidades"
                    className="flex items-center cursor-pointer"
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Mis Comunidades
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <button
                    onClick={logout}
                    className="flex items-center w-full cursor-pointer text-red-600 hover:text-red-700"
                  >
                    <ExitIcon className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Icono de perfil para móvil */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="sm:hidden p-2 rounded-full hover:bg-gray-800 transition focus:outline-none"
                  aria-label="Opciones de usuario"
                >
                  {user.image_url || user.imageUrl ? (
                    <img
                      src={user.image_url || user.imageUrl}
                      alt="Avatar"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <PersonIcon className="h-6 w-6 text-white" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link
                    to="/perfil"
                    className="flex items-center cursor-pointer"
                  >
                    <PersonIcon className="mr-2 h-4 w-4" />
                    Mi Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/mis-comunidades"
                    className="flex items-center cursor-pointer"
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Mis Comunidades
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <button
                    onClick={logout}
                    className="flex items-center w-full cursor-pointer text-red-600 hover:text-red-700"
                  >
                    <ExitIcon className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8h16M4 16h16"
          />
        </svg>
      </button>
    </nav>
  );
};
