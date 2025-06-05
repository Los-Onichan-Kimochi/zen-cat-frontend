'use client';

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { ProfessionalProvider } from '@/context/ProfesionalesContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import HeaderDescriptor from '@/components/common/header-descriptor';
import HomeCard from '@/components/common/home-card';
import { Users, Loader2, Plus, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { professionalsApi } from '@/api/professionals/professionals';
import { Professional, ProfessionalSpecialty } from '@/types/professional';
import { useProfessional } from '@/context/ProfesionalesContext';
import { ProfessionalsTable } from '@/components/professionals/table';
export const Route = createFileRoute('/profesionales/')({
  component: () => (
    <ProfessionalProvider>
      <ProfesionalesComponent />
    </ProfessionalProvider>
  ),
});

interface CalculatedCounts {
  [ProfessionalSpecialty.YOGA_TEACHER]: number;
  [ProfessionalSpecialty.GYM_TEACHER]: number;
  [ProfessionalSpecialty.DOCTOR]: number;
}

function ProfesionalesComponent() {
  const navigate = useNavigate();
  const { setCurrent } = useProfessional();
  const queryClient = useQueryClient();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [profToDelete, setProfToDelete] = useState<Professional | null>(null);

  const { data: professionalsData, isLoading: isLoadingProfessionals, error: errorProfessionals } =
    useQuery<Professional[], Error>({
      queryKey: ['professionals'],
      queryFn: professionalsApi.getProfessionals,
    });

  const { mutate: deleteProfessional, isPending: isDeleting } = useMutation<void, Error, string>({
    mutationFn: (id) => professionalsApi.deleteProfessional(id),
    onSuccess: (_, id) => {
      toast.success('Profesional eliminado', { description: `ID ${id}` });
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      setRowSelection({});
    },
    onError: (err) => {
      toast.error('Error al eliminar', { description: err.message });
    },
  });

  const counts = useMemo<CalculatedCounts | null>(() => {
    if (!professionalsData) return null;
    const c: CalculatedCounts = {
      [ProfessionalSpecialty.YOGA_TEACHER]: 0,
      [ProfessionalSpecialty.GYM_TEACHER]: 0,
      [ProfessionalSpecialty.DOCTOR]: 0,
    };
    professionalsData.forEach((p) => {
      switch (p.specialty) {
        case ProfessionalSpecialty.YOGA_TEACHER:
          c[ProfessionalSpecialty.YOGA_TEACHER]++;
          break;
        case ProfessionalSpecialty.GYM_TEACHER:
          c[ProfessionalSpecialty.GYM_TEACHER]++;
          break;
        case ProfessionalSpecialty.DOCTOR:
          c[ProfessionalSpecialty.DOCTOR]++;
          break;
      }
    });
    return c;
  }, [professionalsData]);

  const handleEdit = (professional: Professional) => {
    setCurrent(professional);
    navigate({ to: '/profesionales/editar' });
  };

  const handleView = (professional: Professional) => {
    localStorage.setItem('currentProfessional', professional.id);
    navigate({ to: `/profesionales/ver` });
  };

  const handleDelete = (professional: Professional) => {
    setProfToDelete(professional);
    setIsDeleteModalOpen(true);
  };

  const btnSizeClasses = "h-11 w-28 px-4";

  if (errorProfessionals) return <p>Error cargando profesionales: {errorProfessionals.message}</p>;

  return (
    <div className="p-6 h-full flex flex-col">
      <HeaderDescriptor title="PROFESIONALES" subtitle="LISTADO DE PROFESIONALES" />

      <div className="flex items-center justify-center space-x-20 mt-2 font-montserrat min-h-[120px]">
        {counts ? (
          <>
            <HomeCard icon={<Users className="w-8 h-8 text-teal-600" />} iconBgColor="bg-teal-100" title="Yoga" description={counts[ProfessionalSpecialty.YOGA_TEACHER]} />
            <HomeCard icon={<Users className="w-8 h-8 text-pink-600" />} iconBgColor="bg-pink-100" title="Gimnasio" description={counts[ProfessionalSpecialty.GYM_TEACHER]} />
            <HomeCard icon={<Users className="w-8 h-8 text-blue-600" />} iconBgColor="bg-blue-100" title="Médicos" description={counts[ProfessionalSpecialty.DOCTOR]} />
          </>
        ) : (
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        )}
      </div>

      <div className="flex justify-end space-x-2 py-4">
        <Link to="/profesionales/nuevo">
          <Button
            size="sm"
            className={`bg-black text-white font-bold rounded-lg flex items-center justify-between shadow hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out ${btnSizeClasses}`}
          >
            <span>Agregar</span>
            <Plus className="w-5 h-5" />
          </Button>
        </Link>

        <Button
          size="sm"
          className={`
            bg-black text-white font-bold rounded-lg
            grid grid-rows-2 grid-cols-[1fr_auto] items-center
            shadow hover:bg-gray-800 hover:scale-105 active:scale-95
            transition-all duration-200 ease-in-out
            ${btnSizeClasses}
          `}
        >
          <span className="row-start-1 col-start-1">Carga</span>
          <span className="row-start-2 col-start-1">Masiva</span>
          <Plus className="row-span-2 col-start-2 justify-self-center w-5 h-5" />
        </Button>
      </div>

      {isLoadingProfessionals ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
        </div>
      ) : (
        <ProfessionalsTable
          data={professionalsData || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      )}

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro que deseas eliminar este profesional?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
              <div className="mt-2 font-medium">Profesional: {profToDelete?.name}</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="space-x-2">
            <AlertDialogCancel onClick={() => setIsDeleteModalOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={() => {
                  if (profToDelete) deleteProfessional(profToDelete.id);
                  setIsDeleteModalOpen(false);
                }}
              >
                Eliminar
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ProfesionalesComponent;
