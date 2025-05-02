import { createFileRoute } from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';
import HomeCard from '@/components/common/home-card';
import { DollarSign, Users, RefreshCw } from 'lucide-react'; // Import from lucide-react

export const Route = createFileRoute('/comunidades')({
  component: ComunidadesComponent,
});

function ComunidadesComponent() {
  return (
    <div className="p-6 h-full">
      <HeaderDescriptor title="COMUNIDADES" subtitle="LISTADO DE COMUNIDADES" />
      
      <div className="flex items-center justify-center space-x-20 mt-8 font-montserrat">
        <HomeCard
          icon={<DollarSign className="w-8 h-8 text-teal-600" />}
          iconBgColor="bg-teal-100"
          title="Total Dinero Servicios"
          description="S./ 150,000"
        />
        <HomeCard
          icon={<Users className="w-8 h-8 text-pink-600" />}
          iconBgColor="bg-pink-100"
          title="Profesionales asignados"
          description="1,250"
        />
        <HomeCard
          icon={<RefreshCw className="w-8 h-8 text-blue-600" />}
          iconBgColor="bg-blue-100"
          title="Servicios abiertos"
          description={56}
        />
      </div>
    </div>
  );
} 