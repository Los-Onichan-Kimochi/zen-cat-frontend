'use client';

import { createFileRoute , Link} from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';
import HomeCard from '@/components/common/home-card';
import { Locate, Plus, Upload, Loader2, MoreHorizontal, CheckCircle, Trash, } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communitiesApi } from '@/api/communities/communities';
import { Community } from '@/types/community';
import { DataTable } from '@/components/common/data-table/data-table';
import { DataTableToolbar } from '@/components/common/data-table/data-table-toolbar';
import { DataTablePagination } from '@/components/common/data-table/data-table-pagination';
import { 
  ColumnDef, 
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
} from '@tanstack/react-table';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { BulkCreateDialog } from "@/components/common/bulk-create-dialog"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ConfirmDeleteSingleDialog } from '@/components/common/confirm-delete-dialogs';

export const Route = createFileRoute('/comunidades/')({
  component: ComunidadesComponent,
});

function ComunidadesComponent() {
  
  //Variables for bulk create
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);  
  const expectedExcelColumns = ["Nombre", "Propósito", "Logo"];
  const dbFieldNames = ["name", "purpose", "image_url"];

  const queryClient = useQueryClient();
  const [communityToDelete, setCommunityToDelete] = useState<Community | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    data: communitiesData,
    isLoading: isLoadingCommunities,
    error: errorCommunities
  } = useQuery<Community[], Error>({
    queryKey: ['communities'],
    queryFn: communitiesApi.getCommunities,
  });

  const { mutate: deleteCommunity, isPending: isDeleting } = useMutation<void, Error, string>({
    mutationFn: (id) => communitiesApi.deleteCommunity(id),
    onSuccess: (_, id) => {
      toast.success('Comunidad eliminada', { description: `ID ${id}` });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      setRowSelection({});
    },
    onError: (err) => {
      toast.error('Error al eliminar', { description: err.message });
    },
  });

  const { mutate: bulkDeleteCommunities, isPending: isBulkDeleting } = useMutation<void, Error, string[]>({
    mutationFn: (ids) => communitiesApi.bulkDeleteCommunities(ids),
    onSuccess: (_, ids) => {
      toast.success('Comunidades eliminadas', { description: `${ids.length} registros` });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      table.resetRowSelection();
    },
    onError: (err) => {
      toast.error('Error al eliminar múltiples comunidades', { description: err.message });
    },
  });

  const counts = useMemo(() => {
    if (!communitiesData) return null;
    return {
      totalCommunities: communitiesData.length,
    };
  }, [communitiesData]);

  //Define the columns of the table  
  const columns = useMemo<ColumnDef<Community>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: {className: "w-[36px] px-3"},
    },
    {
      accessorKey: "id",
      header: "Código",
      cell: ({row}) => {
        const value = row.getValue("id") as string;
        return (
          <div className="max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap" title={value}>{value}</div>
        );
      },
      meta: {className: "w-[150px]"},
    },
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      accessorKey: "purpose",
      header: "Propósito",
    },
    {
      accessorKey: "number_subscriptions",
      header: "Cantidad de miembros",
    },
    {
      id: "actions",
      header:"Acciones",
      cell: ({ row }) => {
        const com = row.original;
        return (
          <div className="flex gap-2 items-center">
            <Link to="/comunidades/ver" search={{ id: com.id }}>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0 border border-black rounded-full flex items-center justify-center hover:bg-gray-200 hover:shadow-md transition-all duration-200">
                <MoreHorizontal className="!w-5 !h-5"/>
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 border border-black rounded-full flex items-center justify-center hover:bg-red-200 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                setCommunityToDelete(com);
                setIsDeleteModalOpen(true);
              }}
            >
              <Trash className="!w-5 !h-5"/>
            </Button>
          </div>
        );
      },
      meta: {className: "w-[100px]"},
    },
  ], [deleteCommunity, bulkDeleteCommunities]);


  const table = useReactTable({
    data: communitiesData || [],
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

  if (errorCommunities) return <p>Error cargando comunidades: {errorCommunities.message}</p>;

  return (
    <div className="p-6 h-full font-montserrat">
      <HeaderDescriptor title="COMUNIDADES" subtitle="LISTADO DE COMUNIDADES" />

      {/* Tarjeta resumen */}
      <div className="mb-6 flex items-center">
        <HomeCard
          icon={<Locate className="w-8 h-8 text-teal-600" />}
          iconBgColor="bg-teal-100"
          title="Comunidades totales"
          description={counts?.totalCommunities ?? 0}
        />
      </div>

      <div className="flex justify-end gap-3 mb-4">
        <Link to="/comunidades/agregar" className="h-10">
          <Button 
            size="sm" 
            className="h-10 bg-black text-white font-bold hover:bg-gray-800 cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4"/> Agregar
          </Button>
        </Link>

        <Button
          size="sm"
          className="h-10 bg-black text-white font-bold hover:bg-gray-800 cursor-pointer"
          onClick={() => setShowUploadDialog(true)}
        >
          <Upload className="mr-2 h-4 w-4"/> Carga Masiva
        </Button>
      </div>
      <div className="mt-0 flex-grow flex flex-col">
        {isLoadingCommunities ? (
          <div className="flex-grow flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="flex-grow flex flex-col">
            <DataTableToolbar
              table={table}
              onBulkDelete={bulkDeleteCommunities}
              isBulkDeleting={isBulkDeleting}
              showBulkDeleteButton={true}
              filterPlaceholder="Buscar registro o celda..."
              showExportButton={true}
              exportFileName="comunidades"
              showFilterButton={true}
              onFilterClick={() => console.log("No hay chance de filtrar XD")}
              showSortButton={true}
            />
            <div className="flex-grow">
              <DataTable 
                table={table} 
                columns={columns}
              />
            </div>
            <DataTablePagination table={table} />
          </div>
        )}
      </div>
      <BulkCreateDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        title="Carga Masiva de Comunidades"
        expectedExcelColumns={expectedExcelColumns}
        dbFieldNames={dbFieldNames}
        onParsedData={async (data) => {
          try {
            await communitiesApi.bulkCreateCommunities(data);
            setShowUploadDialog(false);
            setShowSuccess(true);
            queryClient.invalidateQueries({ queryKey: ['communities'] });
          } catch (error) {
            console.error(error);
            // manejar error visualmente
          }
        }}
      />

      <ConfirmDeleteSingleDialog
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="¿Estas seguro que deseas eliminar esta comunidad?"
        entity="Comunidad"
        itemName={communityToDelete?.name ?? ''}
        onConfirm={() => {
          if (communityToDelete) deleteCommunity(communityToDelete.id);
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