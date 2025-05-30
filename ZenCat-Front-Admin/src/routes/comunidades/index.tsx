'use client';

import { createFileRoute , Link} from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';
import HomeCard from '@/components/common/home-card';
import { Locate, Plus, Upload, Loader2, CircleEllipsis, ArrowUpDown, CheckCircle, Trash, } from 'lucide-react';
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

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
        <Checkbox className='border-gray-400'
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox className='border-gray-400'
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-start gap-1 w-full text-left font-semibold text-base">
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "purpose",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-start gap-1 w-full text-left font-semibold text-base">
          Propósito
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "number_subscriptions",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-start gap-1 w-full text-left font-semibold text-base">
          Cantidad de miembros
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const com = row.original;
        const buttonClasses = "w-8 h-8 p-0 flex items-center justify-center rounded-full hover:bg-gray-200 hover:shadow-md transition-all duration-200";
        return (
          <div className="flex gap-2 items-center">
            <Link to="/comunidades/ver" search={{ id: com.id }}>
              <Button size="sm" variant="ghost" className={buttonClasses}>
                <CircleEllipsis style={{ width: "25px", height: "25px" }} className="text-black" />
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              className={buttonClasses}
              onClick={(e) => {
                e.stopPropagation();
                setCommunityToDelete(com);
                setIsDeleteModalOpen(true);
              }}
            >
              <Trash style={{ width: "25px", height: "25px" }} className="text-black" />
            </Button>
          </div>
        );
      },
    },
  ], [deleteCommunity]);


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

  // Borrado individual
  const confirmDeleteCommunity = () => {
    if (communityToDelete) {
      deleteCommunity(communityToDelete.id);
      setCommunityToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const closeDeleteModal = () => {
    setCommunityToDelete(null);
    setIsDeleteModalOpen(false);
  };

  if (errorCommunities) return <p>Error cargando comunidades: {errorCommunities.message}</p>;

  return (
    <div className="p-6 h-full">
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
        <Link to="/comunidades/nuevo" className="h-10">
          <Button 
            size="sm" 
            className="h-10 bg-gray-800 font-black hover:bg-gray-700 cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4 " /> Agregar
          </Button>
        </Link>

        <Button
          size="sm"
          className="h-10 bg-gray-800 font-black hover:bg-gray-700 cursor-pointer"
          onClick={() => setShowUploadDialog(true)}
        >
          <Upload className="mr-2 h-4 w-4" /> Carga Masiva
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
              filterPlaceholder="Buscar registro o celda..."
              showExportButton={true}
              onExportClick={() => console.log("No hay chance de exportar XD")}
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
      
      {/* Modal de confirmación de borrado */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={closeDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro que deseas eliminar esta comunidad?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.<br />
              Comunidad: <b>{communityToDelete?.name}</b>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteModal}>Cancelar</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                className="bg-red-500 hover:bg-red-600"
                onClick={confirmDeleteCommunity}
              >
                Eliminar
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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