'use client';

import { createFileRoute , Link} from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';
import HomeCard from '@/components/common/home-card';
import { Users, DollarSign, RefreshCw, Plus, Upload, Loader2, MoreHorizontal, ArrowUpDown, CheckCircle} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { communitiesApi } from '@/api/communities/communities';
import { Community } from '@/types/community';
import { DataTable } from '@/components/common/data-table/data-table';
import { DataTableToolbar } from '@/components/common/data-table/data-table-toolbar';
import { DataTablePagination } from '@/components/common/data-table/data-table-pagination';
import { 
  ColumnDef, 
  Row, 
  Column, 
  Table, 
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BulkCreateDialog } from "@/components/common/bulk-create-dialog"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

export const Route = createFileRoute('/comunidades/')({
  component: ComunidadesComponent,
});

function ComunidadesComponent() {
  
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

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // TODO: Add functions to Agregar and Carga Masiva

  const columns = useMemo<ColumnDef<Community>[]>(() => [
    {
      id: "select",
      header: ({ table }: { table: Table<Community> }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: { row: Row<Community> }) => (
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
      accessorKey: "id",
      header: "Código",
    },
    {
      accessorKey: "name",
      header: ({ column }: { column: Column<Community, unknown> }) => {
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
    },
    {
      accessorKey: "purpose",
      header: "Propósito",
    },
    {
      id: "actions",
      cell: ({ row }: { row: Row<Community> }) => {
        const professional = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(professional.id)}
              >
                Copiar ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Ver detalles</DropdownMenuItem>
              <DropdownMenuItem>Editar</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], []);

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

  const isLoading = isLoadingCommunities;

  if (errorCommunities) return <p>Error cargando comunidades: {errorCommunities.message}</p>;

  const transformComunidades = (data: any[]) => {
    return data.map(item => ({
      name: item["Nombre"] ?? "",
      purpose: item["Propósito"] ?? "",
      image_url: item["Logo"] ?? "",
    }));
  };

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
      <div className="flex justify-end space-x-2 py-4">
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
          className="h-10 bg-gray-800 hover:bg-gray-700"
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
        transformData={transformComunidades}
        onParsedData={async (data) => {
          try {
            await communitiesApi.bulkCreateCommunities(data);
            setShowUploadDialog(false);
            setShowSuccess(true);
          } catch (error) {
            console.error(error);
            // manejar error visualmente
          }
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