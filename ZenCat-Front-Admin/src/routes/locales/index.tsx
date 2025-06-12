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

import { useToast } from '@/context/ToastContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';

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
  } = useQuery<Local[], Error>({
    queryKey: ['locals'],
    queryFn: localsApi.getLocals,
  });

  const deleteLocalMutation = useMutation({
    mutationFn: (id: string) => localsApi.deleteLocal(id),
    onSuccess: async (_, id) => {
      toast.success('Local Eliminado', { 
        description: 'El local ha sido eliminado exitosamente.' 
      });
      await refetchLocals();
      queryClient.invalidateQueries({ queryKey: ['locals'] });
      //setRowSelection({});
    },
    onError: (err) => {
      toast.error('Error al Eliminar', { 
        description: err.message || 'No se pudo eliminar el local.' 
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

  const { mutate: bulkCreateLocals, isPending: isBulkCreating } = useMutation({
    mutationFn: localsApi.bulkCreateLocals,
    onSuccess: async () => {
      toast.success('Locales Creados', {
        description: 'Los locales han sido creados exitosamente.',
      });
      await refetchLocals();
      queryClient.invalidateQueries({ queryKey: ['locals'] });
      setShowUploadDialog(false);
      setShowSuccess(true);
    },
    onError: (error: Error) => {
      toast.error('Error en Carga Masiva', {
        description: error.message || 'No se pudieron crear los locales.',
      });
    },
  });

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

  if (errorLocals) return <p>Error cargando locales: {errorLocals.message}</p>;

  return (
    <div className="p-6 h-full flex flex-col font-montserrat">
      <HeaderDescriptor title="LOCALES" subtitle="LISTADO DE LOCALES" />
      <div className="mb-6 flex items-center gap-4">
        <HomeCard
          icon={<MapPin className="w-8 h-8 text-teal-600" />}
          iconBgColor="bg-teal-100"
          title="Locales totales"
          description={localsData?.length || 0}
        />
        <HomeCard
          icon={<MapPin className="w-8 h-8 text-blue-600" />}
          iconBgColor="bg-blue-100"
          title="Region con mayor cantidad de locales: "
          description={
            maxRegion ? `${maxRegion} (${maxCount})` : 'No disponible'
          }
        />
      </div>
      <ViewToolbar
        onAddClick={() => navigate({ to: '/locales/agregar' })}
        onBulkUploadClick={() => setShowUploadDialog(true)}
        addButtonText="Agregar"
        bulkUploadButtonText="Carga Masiva"
      />

      {isLoadingLocals ? (
        <div className="flex justify-center items-center h-64">
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
        />
      )}
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
            bulkCreateLocals({ locals: data });
          } catch (error) {
            console.error(error);
          }
        }}
      />
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
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-md text-center space-y-4">
          <div className="flex justify-center items-center">
            <CheckCircle className="h-20 w-20" strokeWidth={1} />
          </div>
          <h2 className="text-lg font-semibold">
            La carga se realizó exitosamente
          </h2>
          <Button
            className="mx-auto bg-gray-800 hover:bg-gray-700 px-6"
            onClick={() => setShowSuccess(false)}
          >
            Salir
          </Button>
        </DialogContent>
      </Dialog>
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
