import { createFileRoute } from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';
import HomeCard from '@/components/common/home-card';
import { Users, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { professionalsApi, ProfessionalCounts } from '@/api/professionals/professionals';
import { ProfessionalSpecialty } from '@/types/professional';

export const Route = createFileRoute('/profesionales')({
  component: ProfesionalesComponent,
});

function ProfesionalesComponent() {
  const [counts, setCounts] = useState<ProfessionalCounts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchedCounts = await professionalsApi.getProfessionalCounts();
        setCounts(fetchedCounts);
      } catch (error) {
        console.error("Error fetching professional counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 h-full">
      <HeaderDescriptor title="PROFESIONALES" subtitle="LISTADO DE PROFESIONALES" />
      <div className="flex items-center justify-center space-x-20 mt-2 font-montserrat min-h-[120px]">
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        ) : counts ? (
          <>
            <HomeCard
              icon={<Users className="w-8 h-8 text-teal-600"/>}
              iconBgColor="bg-teal-100"
              title="Profesores de yoga"
              description={counts[ProfessionalSpecialty.YOGA_TEACHER]}
            />
            <HomeCard
              icon={<Users className="w-8 h-8 text-pink-600"/>}
              iconBgColor="bg-pink-100"
              title="Profesores de gimnasio"
              description={counts[ProfessionalSpecialty.GYM_TEACHER]}
            />
            <HomeCard
              icon={<Users className="w-8 h-8 text-blue-600"/>}
              iconBgColor="bg-blue-100"
              title="Médicos"
              description={counts[ProfessionalSpecialty.DOCTOR]}
            />
          </>
        ) : (
          <p>Could not load counts.</p>
        )}
      </div>
    </div>
  );
} 