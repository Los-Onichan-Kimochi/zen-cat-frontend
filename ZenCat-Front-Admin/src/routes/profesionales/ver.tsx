'use client';

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { professionalsApi } from '@/api/professionals/professionals';
import HeaderDescriptor from '@/components/common/header-descriptor';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/context/ToastContext';
import {
  Professional,
  UpdateProfessionalPayload,
} from '@/types/professional';
import { fileToBase64 } from '@/utils/imageUtils';

export const Route = createFileRoute('/profesionales/ver')({
  component: ProfessionalPage,
});

function ProfessionalPage() {
  const navigate = useNavigate();
  const id =
    typeof window !== 'undefined'
      ? localStorage.getItem('currentProfessional')
      : null;

  useEffect(() => {
    if (!id) {
      navigate({ to: '/profesionales' });
    }
  }, [id, navigate]);

  if (!id) {
    return null;
  }

  return <ProfessionalDetail id={id} />;
}

function ProfessionalDetail({ id }: { id: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);

  const [initialValues, setInitialValues] = useState({
    name: '',
    first_last_name: '',
    second_last_name: '',
    specialty: '',
    email: '',
    phone_number: '',
  });

  const [name, setName] = useState('');
  const [firstLast, setFirstLast] = useState('');
  const [secondLast, setSecondLast] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    data: prof,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['professional', id, 'withImage'],
    queryFn: () => professionalsApi.getProfessionalWithImage(id),
  });

  const imagePreviewUrl = useMemo(() => {
    if (imagePreview) {
      return imagePreview;
    }
    if (prof && prof.image_bytes) {
      return `data:image/jpeg;base64,${prof.image_bytes}`;
    }
    return null;
  }, [prof, imagePreview]);

  const updateProfessionalMutation = useMutation({
    mutationFn: async (data: UpdateProfessionalPayload) => {
      const payload = data;
      if (imageFile) {
        payload.image_url = imageFile.name;
        const base64Image = await fileToBase64(imageFile);
        payload.image_bytes = base64Image;
      }
      return professionalsApi.updateProfessional(id, payload);
    },
    onSuccess: () => {
      toast.success('Profesional Actualizado', {
        description: 'El profesional ha sido actualizado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['professional', id] });
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      setIsEditing(false);
      setIsEditConfirmOpen(false);
    },
    onError: (error: any) => {
      toast.error('Error al Actualizar Profesional', {
        description: error.message || 'No se pudo actualizar el profesional.',
      });
    },
  });

  useEffect(() => {
    if (prof && initialValues.name === '') {
      setName(prof.name);
      setFirstLast(prof.first_last_name);
      setSecondLast(prof.second_last_name || '');
      setSpecialty(prof.specialty);
      setEmail(prof.email);
      setPhone(prof.phone_number);
      setInitialValues({
        name: prof.name,
        first_last_name: prof.first_last_name,
        second_last_name: prof.second_last_name || '',
        specialty: prof.specialty,
        email: prof.email,
        phone_number: prof.phone_number,
      });
    }
  }, [prof, initialValues.name]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin w-12 h-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">
          Error al cargar el profesional. Es posible que ya no exista.
        </p>
        <Button onClick={() => navigate({ to: '/profesionales' })}>
          Volver a la lista
        </Button>
      </div>
    );
  }

  const hasChanges =
    name !== initialValues.name ||
    firstLast !== initialValues.first_last_name ||
    secondLast !== initialValues.second_last_name ||
    specialty !== initialValues.specialty ||
    email !== initialValues.email ||
    phone !== initialValues.phone_number;

  return (
    <>
      <div className="p-2 md:p-6 h-full flex flex-col font-montserrat">
        <HeaderDescriptor title="PROFESIONALES" subtitle="VER PROFESIONALES" />

        <Card className="mt-6 flex-grow">
          <CardHeader>
            <CardTitle>Datos del profesional</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="grid grid-cols-1 gap-y-6">
              <div>
                <Label htmlFor="name">Nombres</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="first_last_name">Primer Apellido</Label>
                <Input
                  id="first_last_name"
                  value={firstLast}
                  onChange={(e) => setFirstLast(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="second_last_name">Segundo Apellido</Label>
                <Input
                  id="second_last_name"
                  value={secondLast}
                  onChange={(e) => setSecondLast(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="specialty">Especialidad</Label>
                <Input
                  id="specialty"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="phone_number">Teléfono</Label>
                <Input
                  id="phone_number"
                  type="text"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/[^0-9]/g, ''))
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="profileImageFile" className="mb-2 self-start">
                Foto de perfil
              </Label>
              <div className="relative w-full h-96 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50">
                {imagePreviewUrl ? (
                  <img
                    src={imagePreviewUrl}
                    alt="Vista previa del profesional"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <UploadCloud size={48} className="mx-auto" />
                    <p>
                      {isEditing
                        ? 'Arrastre o seleccione una imagen'
                        : 'No hay imagen disponible'}
                    </p>
                  </div>
                )}
                {isEditing && (
                  <Input
                    id="imageFile"
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => navigate({ to: '/profesionales' })}
            >
              Volver
            </Button>
            <Button
              variant="default"
              onClick={() => {
                if (!isEditing) {
                  setIsEditing(true);
                } else if (hasChanges || imageFile) {
                  const payload: UpdateProfessionalPayload = {};
                  if (name !== initialValues.name) payload.name = name;
                  if (firstLast !== initialValues.first_last_name)
                    payload.first_last_name = firstLast;
                  if (secondLast !== initialValues.second_last_name)
                    payload.second_last_name = secondLast;
                  if (specialty !== initialValues.specialty)
                    payload.specialty = specialty;
                  if (email !== initialValues.email) payload.email = email;
                  if (phone !== initialValues.phone_number)
                    payload.phone_number = phone;

                  updateProfessionalMutation.mutate(payload);
                } else {
                  setIsEditing(false);
                }
              }}
            >
              {isEditing ? 'Guardar' : 'Editar'}
            </Button>
          </CardFooter>
        </Card>
      </div>

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
                  updateProfessionalMutation.mutate({
                    name,
                    first_last_name: firstLast,
                    second_last_name: secondLast,
                    specialty,
                    email,
                    phone_number: phone,
                  });
                  setInitialValues({
                    name,
                    first_last_name: firstLast,
                    second_last_name: secondLast,
                    specialty,
                    email,
                    phone_number: phone,
                  });
                }}
                disabled={updateProfessionalMutation.isPending}
              >
                {updateProfessionalMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Confirmar'
                )}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
