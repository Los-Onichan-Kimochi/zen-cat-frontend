import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Community } from './CommunityCard';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SuspendMembershipDialog } from './SuspendMembershipDialog';
import { CancelMembershipDialog } from './CancelMembershipDialog';
import { useNavigate } from '@tanstack/react-router';

interface TabCommunityGeneralProps {
  community: Community | null;
}

export function TabCommunityGeneral({ community }: TabCommunityGeneralProps) {
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const navigate = useNavigate();

  if (!community) {
    return <div>No hay información disponible</div>;
  }

  const handleNewReservation = () => {
    // Navegar a la página de servicios pasando el communityId como search param
    navigate({
      to: '/reserva/servicios',
      search: {
        communityId: community.id,
      },
    });
  };

  const handleSuspendMembership = () => {
    // Aquí iría la lógica para suspender la membresía en la BD
    console.log(`Suspendiendo membresía para comunidad: ${community?.id}`);
    setShowSuspendDialog(false);
    // Aquí podrías actualizar el estado o redirigir a otra página
  };

  const handleCancelMembership = () => {
    // Aquí iría la lógica para cancelar la membresía en la BD
    console.log(`Cancelando membresía para comunidad: ${community?.id}`);
    setShowCancelDialog(false);
    // Aquí podrías actualizar el estado o redirigir a otra página
  };

  return (
    <>
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm py-6">
        <div className="flex justify-between px-6">
          <div className="text-left">
            <h1 className="text-4xl font-black">{community.name}</h1>
          </div>
          <div className="text-right text-xl font-bold">
            <p>
              {community.status === 'active'
                ? 'Membresía activa'
                : community.status === 'suspended'
                  ? 'Membresía suspendida'
                  : 'Membresía vencida'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 mt-4 px-2">
          {/* Bloque de imagen */}
          <div className="flex justify-center items-center px-4">
            <img
              src={community.image || 'default-image-url'}
              alt="Imagen de la comunidad"
              className="rounded-md shadow-md w-full h-full object-cover"
            />
          </div>
          {/* Bloque de botones */}
          <div className="space-y-2 px-4 border-r border-l border-gray-500">
            <h2 className="font-bold text-2xl">Acciones</h2>
            <Button
              className="w-full text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white"
              onClick={handleNewReservation}
            >
              Nueva reserva
            </Button>
            <Button className="w-full text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white">
              Ver reservas
            </Button>
            <Button className="w-full text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white">
              Ver membresías
            </Button>
            <Button
              className="w-full text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white"
              onClick={() => setShowSuspendDialog(true)}
              disabled={community.status !== 'active'}
            >
              Suspender membresía
            </Button>
            <Button
              className="w-full text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white"
              onClick={() => setShowCancelDialog(true)}
            >
              Cancelar membresía
            </Button>
          </div>
          {/* Bloque de información de membresía */}
          <div className="px-4 space-y-4">
            <h2 className="font-bold text-2xl mb-4">Membresía</h2>
            <div className="space-y-5">
              <div className="flex justify-between">
                <p className="text-gray-600">Tipo de plan:</p>
                <p>
                  {community.planType === 'MONTHLY'
                    ? 'Plan básico mensual'
                    : 'Plan anual'}
                </p>
              </div>

              <div className="flex justify-between">
                <p className="text-gray-600">Reservas disponibles:</p>
                <p></p>
              </div>

              <div className="flex justify-between">
                <p className="text-gray-600">Reservas usadas:</p>
                <p></p>
              </div>

              <div className="flex justify-between">
                <p className="text-gray-600">Fecha de inicio:</p>
                <p>
                  {community.startDate
                    ? format(
                        new Date(community.startDate),
                        "dd 'de' MMMM 'del' yyyy",
                        { locale: es },
                      )
                    : 'Sin fecha'}
                </p>
              </div>

              <div className="flex justify-between">
                <p className="text-gray-600">Fecha de fin:</p>
                <p>
                  {community.endDate
                    ? format(
                        new Date(community.endDate),
                        "dd 'de' MMMM 'del' yyyy",
                        { locale: es },
                      )
                    : 'Sin fecha'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diálogos de suspensión y cancelación */}
      <SuspendMembershipDialog
        isOpen={showSuspendDialog}
        onClose={() => setShowSuspendDialog(false)}
        onSuspend={handleSuspendMembership}
        communityName={community.name}
      />

      <CancelMembershipDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onCancel={handleCancelMembership}
        communityName={community.name}
      />
    </>
  );
}
