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
import { UpdateServicePayload, Service } from '@/types/service';
import { fileToBase64 } from '@/utils/imageUtils';

export const Route = createFileRoute('/servicios/servicio-ver')({
  component: SeeServicePageComponent,
});

export function SeeServicePageComponent() {
  const navigate = useNavigate();
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    const serviceId = localStorage.getItem('currentService');
    if (!serviceId) {
      navigate({ to: '/servicios' });
    } else {
      setId(serviceId);
    }
  }, [navigate]);

  if (!id) {
    return (
      <div className="p-6">
        <p>Cargando...</p>
      </div>
    );
  }

  return <ServiceView id={id} />;
}

function ServiceView({ id }: { id: string }) {
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
    isVirtual: '',
    image: '',
  });

  const {
    data: ser,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['service', id, 'withImage'],
    queryFn: () => servicesApi.getServiceWithImage(id!),
    enabled: !!id,
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

  const updateServiceMutation = useMutation({
    mutationFn: (payload: { id: string; data: UpdateServicePayload }) =>
      servicesApi.updateService(payload.id, payload.data),
    onSuccess: () => {
      toast.success('Servicio Actualizado', {
        description: 'El servicio ha sido actualizado correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['service', id, 'withImage'] });
      queryClient.invalidateQueries({ queryKey: ['services'] }); // para la tabla principal
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error('Error al Actualizar', {
        description: error.message || 'No se pudo actualizar el servicio.',
      });
    },
  });

  async function deleteServiceProfessional(professionalId: string) {
    try {
      // Llama a tu API para eliminar la asociación
      await serviceProfessionalApi.deleteServiceProfessional(
        id!,
        professionalId,
      );
      toast.success('Profesional Desvinculado', {
        description:
          'El profesional ha sido desvinculado del servicio exitosamente.',
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

  // Sincronizar el estado del formulario con los datos del servicio
  useEffect(() => {
    if (ser) {
      setName(ser.name);
      setDescription(ser.description);

      if (ser.image_bytes) {
        setImagePreview(`data:image/jpeg;base64,${ser.image_bytes}`);
      } else if (ser.image_url) {
        setImagePreview(ser.image_url);
      } else {
        setImagePreview(null);
      }

      setInitialValues({
        name: ser.name,
        description: ser.description,
        isVirtual: ser.is_virtual ? 'Sí' : 'No',
        image: ser.image_url || '',
      });
    }
  }, [ser]);

  // Sincronizar profesionales asociados
  useEffect(() => {
    if (asociacionesProfesionales) {
      Promise.all(
        asociacionesProfesionales.map((asc) =>
          professionalsApi.getProfessionalById(asc.professional_id),
        ),
      ).then(setProfesionalesSeleccionados);
    } else {
      setProfesionalesSeleccionados([]);
    }
  }, [asociacionesProfesionales]);

  // Sincronizar locales asociados
  useEffect(() => {
    if (asociacionesLocales) {
      Promise.all(
        asociacionesLocales.map((asc) => localsApi.getLocalById(asc.local_id)),
      ).then(setLocalesSeleccionados);
    } else {
      setLocalesSeleccionados([]);
    }
  }, [asociacionesLocales]);

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

  const handleSave = async () => {
    const payload: UpdateServicePayload = {
      name,
      description,
      is_virtual: isVirtual === 'Sí',
    };

    if (imageFile) {
      payload.image_url = imageFile.name;
      try {
        const base64Image = await fileToBase64(imageFile);
        payload.image_bytes = base64Image;
      } catch (error) {
        toast.error('Error al Procesar Imagen', {
          description:
            'No se pudo convertir la imagen. Por favor, intente con otra.',
        });
        return;
      }
    }
    updateServiceMutation.mutate({ id: id!, data: payload });
  };

  const columnsProfesionales: ColumnDef<Professional>[] = [
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
        const professional = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-red-100 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                setProfessionalToDelete(professional);
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

  const tableProfesionales = useReactTable({
    data: profesionalesSeleccionados,
    columns: columnsProfesionales,
    getCoreRowModel: getCoreRowModel(),
    // ... más configuración si es necesaria
  });

  const columnsLocales: ColumnDef<Local>[] = [
    {
      accessorKey: 'local_name',
      header: 'Nombre del Local',
    },
    {
      accessorKey: 'street_name',
      header: 'Dirección',
    },
    {
      accessorKey: 'district',
      header: 'Distrito',
    },
    {
      accessorKey: 'province',
      header: 'Provincia',
    },
    {
      accessorKey: 'region',
      header: 'Región',
    },
    {
      accessorKey: 'capacity',
      header: 'Aforo',
    },
    {
      id: 'actions',
      cell: ({ row }: { row: Row<Local> }) => {
        const local = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              className="h-8 w-8 p-0 bg-white text-black border border-black rounded-full flex items-center justify-center hover:bg-red-100 hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                setLocalToDelete(local);
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

  const tableLocales = useReactTable({
    data: localesSeleccionados,
    columns: columnsLocales,
    getCoreRowModel: getCoreRowModel(),
    // ... más configuración si es necesaria
  });

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error al cargar el servicio.</div>;
  if (!ser) return <div>No se encontró el servicio.</div>;

  return (
    <div className="p-6">
      <HeaderDescriptor
        title={isEditing ? 'EDITAR SERVICIO' : 'VER SERVICIO'}
        subtitle="SERVICIOS"
      />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Datos del Servicio</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Columna Izquierda: Información */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                readOnly={!isEditing}
                className={!isEditing ? 'border-none pl-1' : ''}
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                readOnly={!isEditing}
                className={!isEditing ? 'border-none pl-1' : ''}
              />
            </div>
            <div>
              <Label htmlFor="is_virtual">¿Es virtual?</Label>
              <div className="flex items-center space-x-4 pt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="is_virtual"
                    value="Sí"
                    checked={
                      isEditing ? isVirtual === 'Sí' : ser.is_virtual === true
                    }
                    onChange={(e) => setIsVirtual(e.target.value)}
                    disabled={!isEditing}
                    className="form-radio"
                  />
                  <span className="ml-2">Sí</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="is_virtual"
                    value="No"
                    checked={
                      isEditing ? isVirtual === 'No' : ser.is_virtual === false
                    }
                    onChange={(e) => setIsVirtual(e.target.value)}
                    disabled={!isEditing}
                    className="form-radio"
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Imagen */}
          <div className="flex flex-col">
            <Label>Imagen del Servicio</Label>
            <div
              className="mt-2 w-full h-64 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50 text-gray-400"
              onClick={() =>
                isEditing && document.getElementById('image-upload')?.click()
              }
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="h-full w-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <UploadCloud className="mx-auto h-12 w-12" />
                  <span>
                    {isEditing
                      ? 'Haz clic para subir una imagen'
                      : 'No hay imagen disponible'}
                  </span>
                </div>
              )}
              {isEditing && (
                <input
                  id="image-upload"
                  type="file"
                  className="hidden"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              if (isEditing) {
                // Si está editando, cancelar resetea los cambios
                if (ser) {
                  setName(ser.name);
                  setDescription(ser.description);
                  setIsVirtual(ser.is_virtual ? 'Sí' : 'No');
                  if (ser.image_bytes) {
                    setImagePreview(
                      `data:image/jpeg;base64,${ser.image_bytes}`,
                    );
                  } else if (ser.image_url) {
                    setImagePreview(ser.image_url);
                  } else {
                    setImagePreview(null);
                  }
                }
                setIsEditing(false);
              } else {
                navigate({ to: '/servicios' });
              }
            }}
          >
            {isEditing ? 'Cancelar' : 'Volver'}
          </Button>
          <Button
            onClick={() => {
              if (isEditing) {
                setIsEditConfirmOpen(true);
              } else {
                setIsEditing(true);
                setIsVirtual(ser.is_virtual ? 'Sí' : 'No');
              }
            }}
          >
            {isEditing ? 'Guardar Cambios' : 'Editar'}
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-6">
        {isVirtual === 'Sí' ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Profesionales Asignados</CardTitle>
              <Button
                disabled={!isEditing}
                onClick={() => {
                  localStorage.setItem('modoAgregarProfesional', 'editar');
                  localStorage.setItem('currentService', id);
                  localStorage.setItem(
                    'profesionalesAsociados',
                    JSON.stringify(
                      profesionalesSeleccionados.map((p) => p.id),
                    ),
                  );
                  navigate({
                    to: '/servicios/agregar-profesionales',
                  });
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Asignar Profesional
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                table={tableProfesionales}
                columns={columnsProfesionales}
                //isLoading={loadingAsociacionesProfesionales}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Locales Asignados</CardTitle>
              <Button
                disabled={!isEditing}
                onClick={() => {
                  localStorage.setItem('modoAgregarLocal', 'editar');
                  localStorage.setItem('currentService', id);
                  localStorage.setItem(
                    'localesAsociados',
                    JSON.stringify(localesSeleccionados.map((l) => l.id)),
                  );
                  navigate({ to: '/servicios/agregar-locales' });
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Asignar Local
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                table={tableLocales}
                columns={columnsLocales}
                //isLoading={loadingAsociacionesLocales}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog
        open={isEditConfirmOpen}
        onOpenChange={setIsEditConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Cambios</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres guardar los cambios en este servicio?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres desvincular{' '}
              {professionalToDelete
                ? `${professionalToDelete.name} ${professionalToDelete.first_last_name}`
                : localToDelete?.local_name}
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setProfessionalToDelete(null);
                setLocalToDelete(null);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (professionalToDelete) {
                  deleteServiceProfessional(professionalToDelete.id);
                } else if (localToDelete) {
                  deleteServiceLocal(localToDelete.id);
                }
                setProfessionalToDelete(null);
                setLocalToDelete(null);
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
