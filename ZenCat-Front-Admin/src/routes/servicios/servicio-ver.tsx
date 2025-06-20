'use client';

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { servicesApi } from '@/api/services/services';
import { professionalsApi } from '@/api/professionals/professionals';
import { localsApi } from '@/api/locals/locals';
import { serviceLocalApi } from '@/api/services/service_locals';
import HeaderDescriptor from '@/components/common/header-descriptor';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, UploadCloud, Upload, Plus, Trash } from 'lucide-react';
import { serviceProfessionalApi } from '@/api/services/service_professionals';
import { Professional } from '@/types/professional';
import { Local } from '@/types/local';
import { DataTable } from '@/components/common/data-table/data-table';
import { toast } from 'sonner';
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
import { useToast } from '@/context/ToastContext';

export const Route = createFileRoute('/servicios/servicio-ver')({
  component: SeeServicePageComponent,
});

export function SeeServicePageComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);

  // estados controlados para cada campo
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isVirtual, setIsVirtual] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [profesionalesSeleccionados, setProfesionalesSeleccionados] = useState<
    Professional[]
  >([]);
  const [localesSeleccionados, setLocalesSeleccionados] = useState<Local[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [professionalToDelete, setProfessionalToDelete] =
    useState<Professional | null>(null);
  const [localToDelete, setLocalToDelete] = useState<Local | null>(null);

  const [initialValues, setInitialValues] = useState({
    name: '',
    description: '',
    isVirtual: 'false',
    image: '',
  });

  const id =
    typeof window !== 'undefined'
      ? localStorage.getItem('currentService')
      : null;

  if (!id) {
    navigate({ to: '/servicios' });
    return null;
  }

  const {
    data: ser,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['service', id],
    queryFn: () => servicesApi.getServiceById(id!),
  });

  const {
    data: asociacionesProfesionales,
    isLoading: loadingAsociacionesProfesionales,
  } = useQuery({
    queryKey: ['service-professionals', id],
    queryFn: () =>
      serviceProfessionalApi.fetchServiceProfessionals({ serviceId: id }),
    enabled: !!id,
  });

  const { data: asociacionesLocales, isLoading: loadingAsociacionesLocales } =
    useQuery({
      queryKey: ['service-locals', id],
      queryFn: () => serviceLocalApi.fetchServiceLocals({ serviceId: id }),
      enabled: !!id,
    });

  async function deleteServiceProfessional(professionalId: string) {
    try {
      // Llama a tu API para eliminar la asociación
      await serviceProfessionalApi.deleteServiceProfessional(
        id!,
        professionalId,
      );
      toast.success('Profesional Desvinculado', {
        description: 'El profesional ha sido desvinculado del servicio exitosamente.',
      });
      queryClient.invalidateQueries({
        queryKey: ['service-professionals', id],
      });
    } catch (error: any) {
      toast.error('Error al Desvincular Profesional', {
        description: error.message || 'No se pudo desvincular el profesional.',
      });
    }
  }

  async function deleteServiceLocal(localId: string) {
    try {
      // Llama a tu API para eliminar la asociación
      await serviceLocalApi.deleteServiceLocal(id!, localId);
      toast.success('Local Desvinculado', {
        description: 'El local ha sido desvinculado del servicio exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['service-locals', id] });
    } catch (error: any) {
      toast.error('Error al Desvincular Local', {
        description: error.message || 'No se pudo desvincular el local.',
      });
    }
  }

  // inicializar estados al cargar prof
  useEffect(() => {
    if (ser && initialValues.name === '') {
      setName(ser.name);
      setDescription(ser.description);
      setIsVirtual(ser.is_virtual === true ? 'Sí' : 'No');
      setImagePreview(ser.image_url);
      setInitialValues({
        name: ser.name,
        description: ser.description,
        isVirtual: ser.is_virtual ? 'true' : 'false',
        image: ser.image_url || '',
      });
    }
    if (asociacionesProfesionales && asociacionesProfesionales.length > 0) {
      Promise.all(
        asociacionesProfesionales.map((asc) =>
          professionalsApi.getProfessionalById(asc.professional_id),
        ),
      ).then(setProfesionalesSeleccionados);
    } else {
      setProfesionalesSeleccionados([]);
    }
    if (asociacionesLocales && asociacionesLocales.length > 0) {
      Promise.all(
        asociacionesLocales.map((asc) => localsApi.getLocalById(asc.local_id)),
      ).then(setLocalesSeleccionados);
    } else {
      setLocalesSeleccionados([]);
    }
  }, [ser, initialValues.name, asociacionesProfesionales, asociacionesLocales]);

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

  const columnsProfesionales = [
    {
      accessorKey: 'name',
      header: 'Nombre',
    },
    {
      accessorKey: 'first_last_name',
      header: 'Primer Apellido',
    },
    {
      accessorKey: 'second_last_name',
      header: 'Segundo Apellido',
    },
    {
      accessorKey: 'specialty',
      header: 'Especialidad',
    },
    {
      accessorKey: 'email',
      header: 'Correo Electrónico',
    },
    {
      accessorKey: 'phone_number',
      header: 'Número de Celular',
    },
    {
      id: 'actions',
      cell: ({ row }: { row: Row<Professional> }) => {
        const serv = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-red-100 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                setProfessionalToDelete(serv);
                setIsDeleteModalOpen(true);
              }}
              disabled={!isEditing}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const columnsLocales = [
    {
      accessorKey: 'local_name',
      header: 'Nombre',
    },
    {
      accessorKey: 'district',
      header: 'Distrito',
    },
    {
      id: 'direccion',
      header: 'Dirección',
      accessorFn: (row: any) =>
        `${row.street_name ?? ''} ${row.building_number ?? ''}`,
      cell: ({ row }: { row: any }) => (
        <span>
          {row.original.street_name} {row.original.building_number}
        </span>
      ),
    },
    {
      accessorKey: 'province',
      header: 'Provincia',
    },
    {
      accessorKey: 'capacity',
      header: 'Capacidad',
      cell: ({ row }: { row: any }) => `${row.original.capacity} personas`,
    },
    {
      id: 'actions',
      cell: ({ row }: { row: Row<Local> }) => {
        const loc = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-red-100 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                setLocalToDelete(loc);
                setIsDeleteModalOpen(true);
              }}
              disabled={!isEditing}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const profesionalesTable = useReactTable({
    data: profesionalesSeleccionados,
    columns: columnsProfesionales,
    getCoreRowModel: getCoreRowModel(),
  });

  const localesTable = useReactTable({
    data: localesSeleccionados,
    columns: columnsLocales,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin w-12 h-12" />
      </div>
    );
  }
  if (error || !ser) {
    navigate({ to: '/servicios' });
    return null;
  }

  const hasChanges =
    name !== initialValues.name ||
    description !== initialValues.description ||
    isVirtual !== initialValues.isVirtual ||
    (imageFile && imageFile.name !== initialValues.image);

  return (
    <div className="p-2 md:p-6 h-full flex flex-col font-montserrat">
      <HeaderDescriptor title="SERVICIOS" subtitle="VER SERVICIO" />
      <Card className="mt-6 flex-grow">
        <CardHeader>
          <CardTitle>Datos del Servicio</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Columna Izquierda para campos */}
          <div className="grid grid-cols-1 gap-y-6">
            <div>
              <Label htmlFor="name" className="mb-2">
                Nombre
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <div>
                <Label className="mb-2 block">¿Es virtual?</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="true"
                      checked={isVirtual === 'Sí'}
                      onChange={() => setIsVirtual('Sí')}
                      disabled={!isEditing}
                    />
                    Sí
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="false"
                      checked={isVirtual === 'No'}
                      onChange={() => setIsVirtual('No')}
                      disabled={!isEditing}
                    />
                    No
                  </label>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="description" className="mb-2">
                Descripción
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!isEditing}
                placeholder="Ingrese el segundo apellido"
              />
            </div>
          </div>

          {/* Columna Derecha para foto de perfil y botones */}
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col">
              <Label htmlFor="profileImageFile" className="mb-2 self-start">
                Foto de perfil
              </Label>
              <div className="w-full h-100 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50 mb-4 relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="object-contain h-full w-full rounded-md"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <UploadCloud size={48} className="mx-auto" />
                    <p>Arrastra o selecciona un archivo</p>
                    <p className="text-xs">PNG, JPG, GIF hasta 10MB</p>
                  </div>
                )}
                <Input
                  id="profileImageFile"
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={handleImageChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-end pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate({ to: '/servicios' })}
                className="w-full sm:w-auto"
              >
                Volver
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  if (!isEditing) {
                    setIsEditing(true);
                  } else if (hasChanges) {
                    setIsEditConfirmOpen(true);
                  } else {
                    setIsEditing(false);
                  }
                }}
              >
                {isEditing ? 'Guardar' : 'Editar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {isVirtual === 'Sí' && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Profesionales Asociados</CardTitle>
            <CardDescription>
              Listado de profesionales disponibles para este servicio virtual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end space-x-2 py-4">
              <Button
                onClick={() => {
                  localStorage.setItem(
                    'profesionalesAsociados',
                    JSON.stringify(profesionalesSeleccionados.map((p) => p.id)),
                  );
                  localStorage.setItem('modoAgregarProfesional', 'editar');

                  navigate({ to: '/servicios/agregar-profesionales' });
                }}
                disabled={!isEditing}
              >
                <Plus className="mr-2 h-4 w-4" /> Agregar Profesional
              </Button>
            </div>
            <DataTable
              table={profesionalesTable}
              columns={columnsProfesionales}
            />
          </CardContent>
        </Card>
      )}

      {isVirtual === 'No' && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Locales Asociados</CardTitle>
            <CardDescription>
              Listado de locales disponibles para este servicio virtual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end space-x-2 py-4">
              <Button
                onClick={() => {
                  localStorage.setItem(
                    'localesAsociados',
                    JSON.stringify(localesSeleccionados.map((p) => p.id)),
                  );
                  localStorage.setItem('modoAgregarLocal', 'editar');

                  navigate({ to: '/servicios/agregar-locales' });
                }}
                disabled={!isEditing}
              >
                <Plus className="mr-2 h-4 w-4" /> Agregar Local
              </Button>
            </div>
            <DataTable table={localesTable} columns={columnsLocales} />
          </CardContent>
        </Card>
      )}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {professionalToDelete
                ? '¿Estás seguro que deseas eliminar este profesional asociado?'
                : '¿Estás seguro que deseas eliminar este local asociado?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
              <div className="mt-2 font-medium">
                {professionalToDelete
                  ? `Profesional: ${professionalToDelete.name}`
                  : localToDelete
                    ? `Local: ${localToDelete.local_name ?? localToDelete.id}`
                    : ''}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="space-x-2">
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteModalOpen(false);
                setProfessionalToDelete(null);
                setLocalToDelete(null);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={() => {
                  if (professionalToDelete) {
                    deleteServiceProfessional(professionalToDelete.id);
                    setProfessionalToDelete(null);
                  }
                  if (localToDelete) {
                    deleteServiceLocal(localToDelete.id);
                    setLocalToDelete(null);
                  }
                  setIsDeleteModalOpen(false);
                }}
              >
                Eliminar
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isEditConfirmOpen} onOpenChange={setIsEditConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar modificaciones</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que deseas guardar los cambios realizados?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="space-x-2">
            <AlertDialogCancel onClick={() => setIsEditConfirmOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={() => {
                  servicesApi.updateService(id!, {
                    name,
                    description: description,
                    is_virtual: isVirtual === 'Sí',
                    image_url: imageFile
                      ? URL.createObjectURL(imageFile)
                      : initialValues.image,
                  });
                  setInitialValues({
                    description: description,
                    isVirtual: isVirtual === 'Sí',
                    image_url: imageFile
                      ? URL.createObjectURL(imageFile)
                      : initialValues.image,
                  });
                  setIsEditing(false);
                  setIsEditConfirmOpen(false);
                }}
              >
                Confirmar
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
