import * as React from "react";
import { Link } from '@tanstack/react-router';
import { PersonIcon } from '@radix-ui/react-icons';

const TopBar = () => {
  return (
    <div className="bg-black text-white h-14 flex justify-between items-center px-5">
      <div className="flex items-center">
        <img src="public/ico-astrozen.svg" alt="logo" className="h-10 mr-2" />
        <span className="text-xl font-bold">ASTROCAT</span>
      </div>
      <div className="flex items-center">
        <Link to="/" className="hover:opacity-80 mr-4">Comunidades</Link>
        <div className="border-l border-white h-5 mx-4"></div>
        <Link to="/" className="hover:opacity-80 mr-4">¿Cómo funciona?</Link>
        <div className="border-l border-white h-5 mx-4"></div>
        <Link to="/" className="hover:opacity-80">Membresía</Link>
      </div>
      <div className="flex items-center">
        <div className="border border-white rounded-full w-7 h-7 flex justify-center items-center mr-2">
          <PersonIcon className="text-white text-lg" />
        </div>
        <Link to="/login" className="hover:opacity-80">Iniciar Sesión</Link>
      </div>
    </div>
  );
};

export default TopBar;