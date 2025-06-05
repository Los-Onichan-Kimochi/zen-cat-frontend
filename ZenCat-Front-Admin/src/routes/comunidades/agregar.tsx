'use client';

import { createFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communitiesApi } from '@/api/communities/communities';
import { communityServicesApi } from '@/api/community-services/community-services';
import { CreateCommunityPayload } from '@/types/community';
import { CommunityService, CommunityServiceSelected } from '@/types/community-service';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import HeaderDescriptor from '@/components/common/header-descriptor';
import { toast } from "sonner";
import { useMemo, useEffect, useState } from 'react';
import { Loader2, Plus, Trash, UploadCloud, ChevronUp, ChevronDown} from 'lucide-react';
import '../../index.css';
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
import { DataTable } from '@/components/common/data-table/data-table';
import { DataTableToolbar } from '@/components/common/data-table/data-table-toolbar';
import { DataTablePagination } from '@/components/common/data-table/data-table-pagination';

export const Route = createFileRoute('/comunidades/agregar')({
  component: AddCommunityPageComponent,
})

const communityFormSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido." }),
  purpose: z.string().min(1, { message: "El propósito es requerido." }),
  profileImageFile: z.any().optional(),
});

type CommunityFormData = z.infer<typeof communityFormSchema>;

function AddCommunityPageComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isServicesExpanded, setIsServicesExpanded] = useState(false);
  const [isMembershipPlansExpanded, setIsMembershipPlansExpanded] = useState(false);
  const [communityServiceToDelete, setCommunityServiceToDelete] = useState<CommunityServiceSelected | null>(null);
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
  const [selectedCommunityServices, setSelectedCommunityServices] = useState<CommunityServiceSelected[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("selectedServices");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSelectedCommunityServices(parsed);
    }
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<CommunityFormData>({
    resolver: zodResolver(communityFormSchema),
    defaultValues: {
      name: '',
      purpose: '',
    },
  });

  const createCommunityMutation = useMutation({
    mutationFn: async (data: CreateCommunityPayload) => communitiesApi.createCommunity(data),
    onSuccess: () => {
      toast.success("Comunidad Creada", { description: "La comunidad ha sido agregado exitosamente." });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      navigate({ to: '/comunidades' });
    },
    onError: (error) => {
      toast.error("Error al crear comunidad", { description: error.message || "No se pudo crear la comunidad." });
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    // Esto limpia el contexto cada vez que se entra a la pantalla
    //setDraft(defaultDraft);
  }, []);

  const onSubmit = async (data: CommunityFormData) => {
    let imageUrl = 'https://via.placeholder.com/150';
    if (imageFile) {
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      toast.info("Imagen (simulada)", { description: "Subida de imagen simulada completada." });
    }

    const payload: CreateCommunityPayload = {
      name: data.name,
      purpose: data.purpose,
      image_url: imageUrl,
    };
    createCommunityMutation.mutate(payload);
  };

  const { mutate: deleteCommunityService, isPending: isDeleting } = useMutation<void, Error, string>({
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

  const { mutate: bulkDeleteCommunityServices, isPending: isBulkDeleting } = useMutation<void, Error, string[]>({
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

  //Define the columns of the table  
  const columns = useMemo<ColumnDef<CommunityServiceSelected>[]>(() => [
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
      meta: {className: "w-[32px] px-2"},
    },
    {
      accessorKey: "service.name",
      header: "Nombre",
    },
    {
      accessorKey: "service.is_virtual",
      header: "¿Es virtual?",
      cell: ({ row }) =>
        row.original.service.is_virtual ? "Sí" : "No",
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const comSer = row.original;
        return (
          <div className="flex gap-2 items-center">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 border border-black rounded-full flex items-center justify-center hover:bg-red-200 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                setCommunityServiceToDelete(comSer);
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
  ], [deleteCommunityService, bulkDeleteCommunityServices]);

  const table = useReactTable({
    data: selectedCommunityServices || [],
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

  return (
    <div className="p-2 md:p-6 flex flex-col font-montserrat space-y-6">
      <HeaderDescriptor title="COMUNIDADES" subtitle="AGREGAR COMUNIDAD" />
      <Card>
        <CardHeader>
          <CardTitle>Datos de la comunidad</CardTitle>
          <CardDescription>Complete la información para agregar una nueva comunidad.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Columna Izquierda para campos */}
            <div className="grid grid-cols-1 gap-y-6">
              <div>
                <Label htmlFor="name" className="mb-2">Nombres</Label>
                <Input id="name" {...register("name")} placeholder="Ingrese el nombre de la comunidad" />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="purpose" className="mb-2">Propósito</Label>
                <Textarea
                  id="purpose"
                  {...register("purpose")}
                  placeholder="Ingrese un propósito"
                />
                {errors.purpose && <p className="text-red-500 text-sm mt-1">{errors.purpose.message}</p>}
              </div>
            </div>

            {/* Columna Derecha para el logo y los botones */}
            <div className="flex flex-col space-y-6">
              <div className="flex flex-col">
                <Label htmlFor="logoImageFile" className="mb-2 self-start">Logo</Label>
                <div className="w-full h-100 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50 mb-4 relative">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Vista previa" className="object-contain h-full w-full rounded-md" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <UploadCloud size={48} className="mx-auto"/>
                      <p>Arrastra o selecciona un archivo</p>
                      <p className="text-xs">PNG, JPG, GIF hasta 10MB</p>
                    </div>
                  )}
                   <Input 
                    id="profileImageFile" 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    accept="image/png, image/jpeg, image/gif"
                    {...register("profileImageFile")} 
                    onChange={handleImageChange} 
                  />
                </div>
                {errors.profileImageFile && typeof errors.profileImageFile.message === 'string' && (
                  <p className="text-red-500 text-sm mt-1">{errors.profileImageFile.message}</p>
                )}
              </div>
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-end pt-4">
                <Button variant="outline" type="button" onClick={() => navigate({ to: '/comunidades' })} className="w-full sm:w-auto">Cancelar</Button>
                <Button type="submit" disabled={createCommunityMutation.isPending} className="w-full sm:w-auto">
                  {createCommunityMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar
                </Button>
              </div>
            </div>
          </CardContent>
        </form>
      </Card>
      <Card className="gap-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <CardTitle>Servicios</CardTitle>
            <CardDescription>Seleccione los servicios que brindará la comunidad</CardDescription>
          </div>
          <div>
            <Link to="/comunidades/agregar-servicios" className="h-10">
              <Button 
                size="sm" 
                className="h-10 bg-black text-white font-bold hover:bg-gray-800 cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4"/> Agregar
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-0 flex-grow flex flex-col">
            <div className="flex-grow flex flex-col">
              <DataTableToolbar
                table={table}
                onBulkDelete={bulkDeleteCommunityServices}
                showBulkDeleteButton={true}
                isBulkDeleting={isBulkDeleting}
                filterPlaceholder="Buscar registro o celda..."
                showExportButton={false}
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
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <CardTitle>Planes de Membresía</CardTitle>
            <CardDescription>Seleccione los planes de membresía que tendrá la comunidad</CardDescription>
          </div>
          <div>
            <Button className="w-12 h-12" variant="ghost" onClick={() => setIsMembershipPlansExpanded(!isMembershipPlansExpanded)}>
              {isMembershipPlansExpanded ? <ChevronUp className="!w-8 !h-8"/> : <ChevronDown className="!w-8 !h-8"/>}
            </Button>
          </div>
        </CardHeader>
        {isMembershipPlansExpanded && (
          <CardContent>
            <p>Contenido de los planes de membresía</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
} 