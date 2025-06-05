'use client';

import { createFileRoute , useNavigate} from '@tanstack/react-router';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { Loader2, ChevronLeft } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { servicesApi } from '@/api/services/services';
import { Service } from '@/types/service';
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

export const Route = createFileRoute('/comunidades/agregar-servicios')({
  component: AddCommunityServicePageComponent,
});

function AddCommunityServicePageComponent() {
  
  const navigate = useNavigate();
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
    data: servicesData,
    isLoading: isLoadingServices,
    error: errorServices,
  } = useQuery<Service[], Error>({
    queryKey: ['services'],
    queryFn: servicesApi.getServices,
  });

  // Handler para el botón Cancelar
  const handleCancel = () => {
    navigate({ to: '/comunidades/agregar-comunidad' });
  };

  const handleGuardar = () => {
    const selected = table.getSelectedRowModel().rows.map(row => row.original);

    sessionStorage.setItem("draftSelectedServices", JSON.stringify(selected));

    navigate({ to: '/comunidades/agregar-comunidad' });
  };

  useEffect(() => {
    const stored = sessionStorage.getItem('draftSelectedServices');
    if (stored && servicesData) {
      const restored = JSON.parse(stored) as Service[];

      const newRowSelection: Record<string, boolean> = {};
      restored.forEach((serv) => {
        newRowSelection[serv.id.toString()] = true;
      });

      setRowSelection(newRowSelection);
    }

  }, [servicesData]);

  //Define the columns of the table  
  const columns = useMemo<ColumnDef<Service>[]>(() => [
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
      accessorKey: "name",
      header: "Nombre",
    },
    {
      accessorKey: "is_virtual",
      header: "¿Es virtual?",
      cell: ({ row }) =>
        row.original.is_virtual ? "Sí" : "No",
    },
  ], []);

  const table = useReactTable({
    data: servicesData || [],
    columns,
    getRowId: (row) => row.id.toString(), 
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

  if (errorServices) return <p>Error cargando servicios: {errorServices.message}</p>;

  return (
    <div className="p-6 h-full font-montserrat">
      <HeaderDescriptor title="COMUNIDADES" subtitle="AGREGAR SERVICIOS" />

      <div className="mb-4">
        <Button
          variant="outline" size="default" 
          onClick={() => navigate({ to: '/comunidades/agregar-comunidad' })}
        >
          <ChevronLeft className="w-5 h-5" />
          Volver
        </Button>
      </div>
      <div className="mt-0 flex-grow flex flex-col">
        {isLoadingServices ? (
          <div className="flex-grow flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="flex-grow flex flex-col">
            <DataTableToolbar
              table={table}
              isBulkDeleting={false}
              showBulkDeleteButton={false}
              filterPlaceholder="Buscar registro o celda..."
              showExportButton={false}
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
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-end pt-4">
        <Button variant="outline" type="button" onClick={handleCancel}>Cancelar</Button>
        <Button onClick={handleGuardar} className="w-full sm:w-auto">
          Guardar
        </Button>
      </div>
    </div>
  );
} 