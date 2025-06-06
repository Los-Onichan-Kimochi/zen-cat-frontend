'use client';

import HomeCard from '@/components/common/home-card';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ViewToolbar } from '@/components/common/view-toolbar';
import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { localsApi } from '@/api/locals/locals';
import { Local } from '@/types/local';
import { LocalProvider, useLocal } from '@/context/LocalesContext';
import { LocalsTable } from '@/components/locals/local-table';
import { ConfirmDeleteSingleDialog, ConfirmDeleteBulkDialog} from '@/components/common/confirm-delete-dialogs';
import { BulkCreateDialog } from '@/components/common/bulk-create-dialog';
import { SuccessDialog } from '@/components/common/success-bulk-create-dialog';

import { Locate, Loader2, ArrowUpDown, MoreHorizontal, Plus, Upload, Trash, MapPin, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent} from "@/components/ui/dialog";



export const Route = createFileRoute('/locales/')({
  component: LocalesComponent,
});

function LocalesComponent() {
  const navigate = useNavigate();
  const { setCurrent } = useLocal();
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [localToDelete, setLocalToDelete] = useState<Local | null>(null);
  const [resetSelectionTrigger, setResetSelectionTrigger] = useState(0);

  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  //bulk Create variables
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const expectedExcelColumns = ["Nombre", "Calle", "Numero", "Distrito", "Provincia", "Region", "Referencia", "Capacidad", "ImagenUrl"];
  const dbFieldNames = ["local_name", "street_name", "building_number","district","province","region","reference","capacity","image_url"];
  //General
  const {
    data: localsData,
    isLoading: isLoadingLocals,
    error: errorLocals,
  } = useQuery<Local[], Error>({
    queryKey: ['locals'],
    queryFn: localsApi.getLocals,
  });

  const deleteLocalMutation = useMutation({
    mutationFn: (id: string) => localsApi.deleteLocal(id),
    onSuccess: (_, id) => {
      toast.success('Local eliminado', { description: `ID ${id}` });
      queryClient.invalidateQueries({ queryKey: ['locals'] });
      //setRowSelection({});
    },
    onError: (err) => {
      toast.error('Error al eliminar local', { description: err.message });
    },
  });
  /*
  const {mutate: bulkDeleteLocals,isPending: isBulkDeleting} = useMutation<void, Error, string[]>({
    mutationFn: (ids) => localsApi.bulkDeleteLocals(ids),
    onSuccess: (_, ids) => {
      toast.success('Locales eliminados', { description: `IDs ${ids}` });
      queryClient.invalidateQueries({ queryKey: ['locals'] });
      //setRowSelection({});
    },
    onError: (err) => {
      toast.error('Error al eliminar múltiples locales', { description: err.message });
    },
  })
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
    navigate({ to: '/locales/editar', search: { id: local.id }  });
  };

  const handleView = (local: Local) => {
    localStorage.setItem('currentLocal', local.id);
    navigate({ to: `/locales/ver` });
  };

  const handleDelete = (local: Local) => {
    setLocalToDelete(local);
    setIsDeleteModalOpen(true);
  };

  const handleBulkDelete = (ids: string[]) => {
    
  };

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
        onBulkUploadClick={() => console.log('Carga Masiva clickeada')}
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
          isBulkDeleting={false}//bulkDeleteLocalMutation.isPending
          onEdit={handleEdit}
          onDelete={handleDelete}
          resetRowSelectionTrigger={resetSelectionTrigger}
        />
      )}
      <BulkCreateDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        title="Carga Masiva de Locales"
        expectedExcelColumns={expectedExcelColumns}
        dbFieldNames={dbFieldNames}
        onParsedData={async (data) => {
          try {
            await localsApi.bulkCreateLocals(data);
            setShowUploadDialog(false);
            setShowSuccess(true);
            queryClient.invalidateQueries({ queryKey: ['locals'] });
          } catch (error) {
            console.error("Error al cargar los locales:", error);
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
          if (localToDelete) localsApi.deleteLocal(localToDelete.id);
          setIsDeleteModalOpen(false);
        }}
      />
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-md text-center space-y-4">
          <div className="flex justify-center items-center">
            <CheckCircle className="h-20 w-20" strokeWidth={1} />
          </div>
          <h2 className="text-lg font-semibold">La carga se realizó exitosamente</h2>
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