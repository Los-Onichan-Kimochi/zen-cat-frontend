
import { Outlet } from '@tanstack/react-router';
import { User } from "@/types/user"
import TopBar from "@/components/ui/TopBar"; // Importa el componente TopBar


const MainLayout = () => {
  return (
    <div className="app-layout"> {/* Puedes añadir clases para estilos generales del layout */}
      <TopBar /> {/* Aquí renderizamos el componente TopBar */}
      <div className="content">
        <Outlet /> {/* Aquí se renderizará el contenido de las rutas hijas (como tu HomeComponent) */}
      </div>
      {/* Puedes añadir un Footer aquí si lo tienes */}
    </div>
  );
};

export default MainLayout;

