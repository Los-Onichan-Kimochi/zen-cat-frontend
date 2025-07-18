'use client';

import HomeCard from '@/components/common/home-card';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ViewToolbar } from '@/components/common/view-toolbar';

import { LocalProvider, useLocal } from '@/context/LocalesContext';
import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { localsApi } from '@/api/locals/locals';
import { Local } from '@/types/local';
import { BulkCreateLocalPayload } from '@/types/local'; //adicionar
import { LocalsTable } from '@/components/locals/local-table';
import {
  ConfirmDeleteSingleDialog,
  ConfirmDeleteBulkDialog,
} from '@/components/common/confirm-delete-dialogs';
import { BulkCreateDialog } from '@/components/common/bulk-create-dialog';
import { Button } from '@/components/ui/button';
import { useBulkDelete } from '@/hooks/use-bulk-delete';
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
import { SuccessDialog } from '@/components/common/success-bulk-create-dialog';

import {
  Locate,
  Loader2,
  ArrowUpDown,
  MoreHorizontal,
  Plus,
  Upload,
  Trash,
  MapPin,
  CheckCircle,
} from 'lucide-react';

import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';

import { useToast } from '@/context/ToastContext';

export const Route = createFileRoute('/locales/')({
  component: LocalesComponent,
});

function LocalesComponent() {
  const navigate = useNavigate();
  const { setCurrent } = useLocal();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [localToDelete, setLocalToDelete] = useState<Local | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [resetSelectionTrigger, setResetSelectionTrigger] = useState(0);

  //const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  //const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  //bulk Create variables
  //const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  //const expectedExcelColumns = ["Nombre", "Calle", "Numero", "Distrito", "Provincia", "Region", "Referencia", "Capacidad", "ImagenUrl"];
  //const dbFieldNames = ["local_name", "street_name", "building_number","district","province","region","reference","capacity","image_url"];
  //General
  const {
    data: localsData,
    isLoading: isLoadingLocals,
    error: errorLocals,
    refetch: refetchLocals,
    isFetching: isFetchingLocals,
  } = useQuery<Local[], Error>({
    queryKey: ['locals'],
    queryFn: localsApi.getLocals,
  });

  const deleteLocalMutation = useMutation({
    mutationFn: (id: string) => localsApi.deleteLocal(id),
    onSuccess: async (_, id) => {
      toast.success('Local Eliminado', {
        description: 'El local ha sido eliminado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['locals'] });
    },
    onError: (err) => {
      toast.error('Error al Eliminar', {
        description: err.message || 'No se pudo eliminar el local.',
      });
    },
  });

  // Hook para bulk delete que maneja automáticamente la actualización
  const { handleBulkDelete, isBulkDeleting } = useBulkDelete<Local>({
    queryKey: ['locals'],
    deleteFn: (ids: string[]) => localsApi.bulkDeleteLocals({ locals: ids }),
    entityName: 'local',
    entityNamePlural: 'locales',
    getId: (local) => local.id,
    onSuccess: () => {
      // Resetear selecciones después del éxito
      setResetSelectionTrigger((prev) => prev + 1);
    },
  });
  /** 
    const { mutate: bulkCreateLocals, isPending: isBulkCreating } = useMutation<
      Local[],                          // Tipo de dato que devuelve el servidor
      Error,                            // Tipo de error
      BulkCreateLocalPayload            // Tipo de dato que se le pasa (¡la clave!)
    >({
      mutationFn: localsApi.bulkCreateLocals,
      onSuccess: async () => {
        toast.success('Locales creados exitosamente');
        await refetchLocals();
        queryClient.invalidateQueries({ queryKey: ['locals'] });
        setShowUploadDialog(false);
        setShowSuccess(true);
      },
      onError: (error: Error) => {
        toast.error('Error durante la carga masiva', { description: error.message });
      },
    });
  */
  const { maxRegion, maxCount } = useMemo(() => {
    const regionCounts = localsData?.reduce(
      (acc, local) => {
        const region = local.region; // Asegúrate de que `region` es el nombre correcto
        acc[region] = (acc[region] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    let maxRegion = '';
    let maxCount = 0;

    if (regionCounts) {
      for (const [region, count] of Object.entries(regionCounts)) {
        if (count > maxCount) {
          maxRegion = region;
          maxCount = count;
        }
      }
    }
    return { maxRegion, maxCount };
  }, [localsData]);
  const handleEdit = (local: Local) => {
    setCurrent(local);
    localStorage.setItem('currentLocal', local.id);
    navigate({ to: '/locales/editar', search: { id: local.id } });
  };

  const handleView = (local: Local) => {
    localStorage.setItem('currentLocal', local.id);
    navigate({ to: `/locales/ver`, search: { id: local.id } });
  };

  const handleDelete = (local: Local) => {
    setLocalToDelete(local);
    setIsDeleteModalOpen(true);
  };

  const handleRefresh = async () => {
    const startTime = Date.now();

    const result = await refetchLocals();

    // Asegurar que pase al menos 1 segundo
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, 1000 - elapsedTime);

    if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }

    return result;
  };

  if (errorLocals) return <p>Error cargando locales: {errorLocals.message}</p>;

  return (
    <div className="p-6 h-screen flex flex-col font-montserrat overflow-hidden">
      <HeaderDescriptor title="LOCALES" subtitle="LISTADO DE LOCALES" />

      {/* Statistics Section */}
      <div className="flex-shrink-0">
        <div className="mb-6 flex items-center gap-4">
          <HomeCard
            icon={<MapPin className="w-8 h-8 text-emerald-600" />}
            iconBgColor="bg-emerald-100"
            title="Locales totales"
            description={localsData?.length || 0}
            descColor="text-emerald-600"
            isLoading={isFetchingLocals}
          />
          <HomeCard
            icon={<MapPin className="w-8 h-8 text-orange-600" />}
            iconBgColor="bg-orange-100"
            title="Region con mayor cantidad de locales: "
            description={
              maxRegion ? `${maxRegion} (${maxCount})` : 'No disponible'
            }
            descColor="text-orange-600"
            isLoading={isFetchingLocals}
          />
        </div>

        <ViewToolbar
          onAddClick={() => navigate({ to: '/locales/agregar' })}
          onBulkUploadClick={() => setShowUploadDialog(true)}
          addButtonText="Agregar"
          bulkUploadButtonText="Carga Masiva"
        />
      </div>

      {/* Table Section */}
      <div className="flex-1 flex flex-col min-h-0">
        {isLoadingLocals ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
          </div>
        ) : (
          <LocalsTable
            data={localsData || []}
            onBulkDelete={handleBulkDelete}
            isBulkDeleting={isBulkDeleting}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            resetRowSelectionTrigger={resetSelectionTrigger}
            onRefresh={handleRefresh}
            isRefreshing={isFetchingLocals}
          />
        )}
      </div>
      <BulkCreateDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        title="Carga Masiva de Locales"
        expectedExcelColumns={[
          'Nombre del Local',
          'Nombre de la Calle',
          'Número de Edificio',
          'Distrito',
          'Provincia',
          'Región',
          'Referencia',
          'Capacidad',
          'URL de Imagen',
        ]}
        dbFieldNames={[
          'local_name',
          'street_name',
          'building_number',
          'district',
          'province',
          'region',
          'reference',
          'capacity',
          'image_url',
        ]}
        onParsedData={async (data) => {
          try {
            const transformedData = data.map((item) => ({
              local_name: item.local_name?.toString().trim(),
              street_name: item.street_name?.toString().trim(),
              building_number: item.building_number?.toString().trim(),
              district: item.district?.toString().trim(),
              province: item.province?.toString().trim(),
              region: item.region?.toString().trim(),
              reference: item.reference?.toString().trim(),
              capacity: Number(item.capacity),
              image_url: item.image_url?.toString().trim(),
            }));

            // Validación básica
            const isValid = transformedData.every(
              (item) =>
                item.local_name &&
                item.street_name &&
                item.building_number &&
                item.district &&
                item.province &&
                item.region &&
                item.reference &&
                !isNaN(item.capacity) &&
                item.image_url,
            );

            if (!isValid) {
              toast.error(
                'Algunos registros tienen campos vacíos o inválidos.',
              );
              console.error('Datos inválidos:', transformedData);
              return;
            }

            console.log(
              'Request final:',
              JSON.stringify({ locals: transformedData }, null, 2),
            );
            await localsApi.bulkCreateLocals({ locals: transformedData });
            queryClient.invalidateQueries({ queryKey: ['locals'] });
            setShowUploadDialog(false);
            setShowSuccess(true);
          } catch (error: any) {
            if (error instanceof Error) {
              toast.error('Error durante la carga masiva', {
                description: error.message,
              });
            } else {
              toast.error('Error desconocido durante la carga masiva');
            }
            console.error('Detalle del error:', error);
          }
        }}
      >
        <div className="px-1 pt-1 text-sm text-muted-foreground space-y-1">
          <p>
            El archivo debe contener las siguientes columnas (en este orden):<br />
            <strong>
              Nombre del Local, Nombre de la Calle, Número de Edificio, Distrito, Provincia, Región, 
              Referencia, Capacidad, URL de Imagen
            </strong>
          </p>
          <ul className="list-disc list-inside">
            <li>Todos los campos son obligatorios.</li>
            <li>La capacidad debe ser un número válido.</li>
          </ul>
          <a
            href="/plantillas/plantilla-carga-locales.xlsx"
            className="text-blue-600 hover:underline"
            download
          >
            Descargar plantilla de ejemplo
          </a>
        </div>


      </BulkCreateDialog>

      <ConfirmDeleteSingleDialog
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="¿Estas seguro que deseas eliminar este local?"
        entity="Local"
        itemName={localToDelete?.local_name ?? ''}
        onConfirm={() => {
          if (localToDelete) deleteLocalMutation.mutate(localToDelete.id);
          setIsDeleteModalOpen(false);
        }}
      />

      <SuccessDialog
        open={showSuccess}
        onOpenChange={setShowSuccess}
        title="La carga se realizó exitosamente"
        description="Todos los locales se registraron correctamente."
        buttonText="Cerrar"
      />
    </div>
  );
}

export default LocalesComponent;
/*
      <ConfirmDeleteBulkDialog
        isOpen={isBulkDeleteModalOpen} 
        onOpenChange={setIsBulkDeleteModalOpen} 
        onConfirm={() => {
          const selectedIds = Object.keys(rowSelection);
          setIsBulkDeleteModalOpen(false);
          bulkDeleteLocals(selectedIds);
        }}
        count = {Object.keys(rowSelection).length}
        //isLoading={isBulkDeleting}
      />
*/
