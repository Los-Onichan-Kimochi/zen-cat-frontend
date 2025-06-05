'use client';

import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/common/data-table/data-table';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import HeaderDescriptor from '@/components/common/header-descriptor';
import { toast } from "sonner";
import { useState } from 'react';
import { Loader2, UploadCloud,  Plus, Upload, Trash} from 'lucide-react';
import '../../index.css';
import { Service } from '@/types/service';
import { CreateCommunityPayload } from '@/types/community';
import { communitiesApi } from '@/api/communities/communities';
import { communityServicesApi } from '@/api/communities/community-services';

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
import { useMatch } from '@tanstack/react-router';
import { useEffect, useMemo} from 'react';
import { useRouterState } from '@tanstack/react-router';

export const Route = createFileRoute('/comunidades/agregar-deprecated2')({
  component: AddComunityPageComponent,
});

export const communityFormSchema = z.object({
  name: z.string().min(1, { message: "El nombre de la comunidad es requerida." }),
  purpose: z.string().min(1, { message: "El propósito es requerido." }),
  image_url: z.any().optional(),
});

type CommunityFormData = z.infer<typeof communityFormSchema>;

function AddComunityPageComponent() {
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { register, handleSubmit, control, formState: { errors }, watch, reset } = useForm<CommunityFormData>({
    resolver: zodResolver(communityFormSchema),
    defaultValues: {
      name: '',
      purpose: '',
    },
  });
  const createCommuntiyMutation = useMutation({
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

  const match = useMatch({ from: '/comunidades/agregar-comunidad' });

  const locationState = useRouterState({ select: (s) => s.location.state }) as {
    draftSelectedServices?: any[];
  } | null;

  const initialSelectedServices = locationState?.draftSelectedServices ?? [];

  const [selectedServices, setSelectedServices] = useState(initialSelectedServices);

  useEffect(() => {
    
    console.log("Effect executed");
    const draftCommunity = sessionStorage.getItem('draftCommunity');
    
    if (draftCommunity) {
      const values = JSON.parse(draftCommunity);
      reset(values); 
    }

    const storedServices = sessionStorage.getItem('draftSelectedServices');
    if (storedServices) {
      try {
        console.log('Cargado desde localStorage:', JSON.parse(storedServices));
        setSelectedServices(JSON.parse(storedServices));
      } catch (error) {
        console.error('Failed to parse saved services', error);
      }
    }
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


    try {
      const newCommunity = await communitiesApi.createCommunity(payload);

      // 2. Bulk create de CommunityService
      if (selectedServices.length > 0) {
          const bulkPayload = selectedServices.map((service) => ({
            community_id: newCommunity.id,
            service_id: service.id,
          }));

          await communityServicesApi.bulkCreateCommunityServices(bulkPayload);
      }

      toast.success("Servicio y profesionales asociados creados correctamente.");
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      navigate({ to: '/comunidades' });
    } catch (error: any) {
        toast.error("Error al crear servicio o asociar profesionales", { description: error.message });
    }

  };

  //Define the columns of the table services
  /*const serviceColumns = [
  {
      accessorKey: 'name',
      header: 'Nombre',
    },
    {
      accessorKey: 'is_virtual',
      header: '¿Es virtual?',
    },
  ];*/
  const serviceColumns= useMemo<ColumnDef<Service>[]>(() => [
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
      accessorKey: "name",
      header: "Nombre",
    },
    {
      accessorKey: "is_virtual",
      header: "¿Es virtual?",
      cell: ({ row }) => row.original.is_virtual ? "Sí" : "No",
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const service = row.original;
        return (
          <div className="flex gap-2 items-center">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 border border-black rounded-full flex items-center justify-center hover:bg-red-200 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                /*setCommunityServiceToDelete(comSer);
                setIsDeleteModalOpen(true);*/
              }}
            >
              <Trash className="!w-5 !h-5"/>
            </Button>
          </div>
        );
      },
      meta: {className: "w-[100px]"},
    },
  ], [/*deleteCommunityService, bulkDeleteCommunityServices*/])

  const serviceTable = useReactTable({
    data: selectedServices,
    columns: serviceColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-2 md:p-6 h-full flex flex-col font-montserrat">
      <HeaderDescriptor title="COMUNIDADES" subtitle="AGREGAR COMUNIDAD" />
      <Card className="mt-6 flex-grow">
        <CardHeader>
          <CardTitle>Datos de la comunidad</CardTitle>
          <CardDescription>Complete la información para agregar una nueva comunidad.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Columna Izquierda para campos */}
            <div className="grid grid-cols-1 gap-y-6">
              <div>
                <Label htmlFor="name" className="mb-2">Nombre</Label>
                <Input id="name" {...register("name")} placeholder="Ingrese el nombre de la comunidad" />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="purpose" className="mb-2">Propósito</Label>
                <Input id="purpose" {...register("purpose")} placeholder="Ingrese el propósito" />
              </div>
              
              
            </div>

            {/* Columna Derecha para foto de perfil y botones */}
            <div className="flex flex-col space-y-6">
              <div className="flex flex-col">
                <Label htmlFor="profileImageFile" className="mb-2 self-start">Foto de perfil</Label>
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
                    {...register("image_url")} 
                    onChange={handleImageChange} 
                  />
                </div>
                {errors.image_url && typeof errors.image_url.message === 'string' && (
                  <p className="text-red-500 text-sm mt-1">{errors.image_url.message}</p>
                )}
              </div>
              
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-end pt-4">
                <Button variant="outline" type="button" onClick={() => navigate({ to: '/servicios' })} className="w-full sm:w-auto">Cancelar</Button>
                <Button type="submit" disabled={createCommuntiyMutation.isPending} className="w-full sm:w-auto">
                  {createCommuntiyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar
                </Button>
              </div>
            </div>
          </CardContent>
        </form>
      </Card>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Servicios Asociados</CardTitle>
            <CardDescription>Listado de servicios disponibles para esta comunidad.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end space-x-2 py-4">
              <Button
                onClick={() => {
                  
                  const data = watch(); // obtiene valores actuales del form
                  sessionStorage.setItem('draftCommunity', JSON.stringify(data));
                  sessionStorage.setItem('draftSelectedServices', JSON.stringify(selectedServices));
                  navigate({ to: '/comunidades/agregar-servicios' });
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Agregar Profesional
              </Button>
            </div>
            <DataTable
              table={serviceTable}
              columns={serviceColumns}
            />
          </CardContent>
        </Card>
    </div>
  );
} 