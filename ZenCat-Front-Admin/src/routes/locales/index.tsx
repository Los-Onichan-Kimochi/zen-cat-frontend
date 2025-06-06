'use client';

import HomeCard from '@/components/common/home-card';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { localsApi } from '@/api/locals/locals';
import { Local } from '@/types/local';
//import { LocalProvider, useLocal } from '@/context/LocalesContext';
import { ConfirmDeleteSingleDialog, ConfirmDeleteBulkDialog} from '@/components/common/confirm-delete-dialogs';
import { BulkCreateDialog } from '@/components/common/bulk-create-dialog';
import { SuccessDialog } from '@/components/common/success-bulk-create-dialog';

import { Locate, Loader2, ArrowUpDown, MoreHorizontal, Plus, Upload, Trash, MapPin, CheckCircle } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Dialog, DialogContent} from "@/components/ui/dialog";


export const Route = createFileRoute('/locales/')({
  component: LocalesComponent,
});
function LocalesComponent(){
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [localToDelete, setLocalToDelete] = useState<Local | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  //bulk Create variables
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const expectedExcelColumns = ["Nombre", "Calle", "Numero", "Distrito", "Provincia", "Region", "Referencia", "Capacidad", "ImagenUrl"];
  const dbFieldNames = ["local_name", "street_name", "building_number","district","province","region","reference","capacity","image_url"];
  //General
  
  const { setCurrent } = useLocal();
  const queryClient = useQueryClient();
  

  //const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const { 
    data: localsData,
    isLoading: isLoadingLocals,
    error: errorLocals
  } = useQuery<Local[], Error>({
    queryKey: ['locals'],
    queryFn: localsApi.getLocals,
  });
  const { mutate: deleteLocal, isPending: isDeleting } = useMutation<void, Error, string>({
    mutationFn: (id) => localsApi.deleteLocal(id),
    onSuccess: (_, id) => {
      toast.success('Local eliminado', { description: `ID ${id}` });
      queryClient.invalidateQueries({ queryKey: ['locals'] });
      setRowSelection({});
    },
    onError: (err) => {
      toast.error('Error al eliminar', { description: err.message });
    },
  });
  const {mutate: bulkDeleteLocals,isPending: isBulkDeleting} = useMutation<void, Error, string[]>({
    mutationFn: (ids) => localsApi.bulkDeleteLocals(ids),
    onSuccess: (_, ids) => {
      toast.success('Locales eliminados', { description: `IDs ${ids}` });
      queryClient.invalidateQueries({ queryKey: ['locals'] });
      setRowSelection({});
    },
    onError: (err) => {
      toast.error('Error al eliminar múltiples locales', { description: err.message });
    },
  })
  const { maxRegion, maxCount } = useMemo(() => {
    const regionCounts = localsData?.reduce((acc, local) => {
        const region = local.region; // Asegúrate de que `region` es el nombre correcto
        acc[region] = (acc[region] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
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
  const columns = useMemo<ColumnDef<Local>[]>(() => [
      {
        id: "select",
        header: ({ table }: { table: Table<Local> }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }: { row: Row<Local> }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value: boolean | 'indeterminate') => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "local_name",
        header: ({ column }: { column: Column<Local, unknown> }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Nombre
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }: { row: Row<Local> }) => <div>{row.getValue("local_name")}</div>
      },
      //{
      //  id: "lastNames",
      //  header: "Apellidos",
      //  accessorFn: (row: Local) => `${row.first_last_name} ${row.second_last_name || ''}`,
      //},
      {
        accessorKey: "street_name",
        header: "Dirección",
      },
      {
        accessorKey: "building_number",
        header: "Número",
      },
      {
        accessorKey: "reference",
        header: "Referencia",
      },
      {
        accessorKey: "district",
        header: ({ column }: { column: Column<Local, unknown> }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Distrito
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
      },
      {
        accessorKey: "province",
        header: ({ column }: { column: Column<Local, unknown> }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Provincia
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
      },
      {
        accessorKey: "region",
        header: ({ column }: { column: Column<Local, unknown> }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Región
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const local = row.original;
          return (
            <div className="flex items-center space-x-2">
              <Button
                className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-red-100 hover:shadow-md transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  localStorage.setItem('currentLocal', local.id);
                  navigate({ to: `/locales/ver` });
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              <Button
                className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-red-100 hover:shadow-md transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocalToDelete(local);
                  setIsDeleteModalOpen(true);
                }}
                >
                    <Trash className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ], [deleteLocal, bulkDeleteLocals,navigate, setCurrent]);

  const table = useReactTable({
    data: localsData || [],
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onGlobalFilterChange: setGlobalFilter,
      onPaginationChange: setPagination,
      onColumnVisibilityChange: setColumnVisibility,
      onRowSelectionChange: setRowSelection,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      manualPagination: false,
      enableRowSelection: true,
      debugTable: true,
   });

   const isLoading = isLoadingLocals;

   if (errorLocals) return <p>Error cargando locales: {errorLocals.message}</p>;

  return (
    <div className="p-6 h-full flex flex-col">
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
          description={maxRegion ? `${maxRegion} (${maxCount})` : 'No disponible'}
        />
      </div>
       <div className="flex justify-end space-x-2 py-4">
        <Button
          className="bg-black text-white font-bold rounded-lg flex items-center gap-2 px-5 py-2 h-11 shadow hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out"
          onClick={() => navigate({ to: '/locales/agregar' })}
        >
          Agregar <Plus className="w-5 h-5" />
        </Button>
        <Button 
          size="sm" 
          className="h-10 bg-gray-800 font-black hover:bg-gray-700 cursor-pointer" 
          onClick={() => setShowUploadDialog(true)}
          >
          <Upload className="mr-2 h-4 w-4" /> Carga Masiva
        </Button>
      </div>

      {isLoadingLocals ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="-mx-4 flex-1 overflow-auto px-4 py-2">
          <DataTableToolbar
            table={table}
            onBulkDelete={bulkDeleteLocals}
            isBulkDeleting={isBulkDeleting}
            showBulkDeleteButton={true}
            filterPlaceholder="Buscar locales..."
            showSortButton={true}
            showExportButton={true}
            //onExportClick={() => console.log("Exportar clickeado")}
            exportFileName="locales"
            showFilterButton={true}
            onFilterClick={() => console.log("Filtrar por clickeado")}
          />
          <div className="flex-1 overflow-hidden rounded-md border">
            <DataTable table={table} columns={columns} />
          </div>
          <DataTablePagination table={table} />
        </div>
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
          if (localToDelete) deleteLocal(localToDelete.id);
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
    </div>

  );
  
}

export default LocalesComponent;