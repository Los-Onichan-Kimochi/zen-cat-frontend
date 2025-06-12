import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Loader2 } from 'lucide-react';
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usuariosApi } from '@/api/usuarios/usuarios';
import { UpdateUserPayload } from '@/types/user';
import { toast } from 'sonner';
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

export const Route = createFileRoute('/usuarios/editar')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      id: search.id as string,
    };
  },
  component: EditarUsuario,
});

function EditarUsuario() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const search = useSearch({ from: '/usuarios/editar' });
  const userId = search.id;
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Query para obtener el usuario
  const { data: user, isLoading } = useQuery({
    queryKey: ['usuario', userId],
    queryFn: () => usuariosApi.getUsuarioById(userId),
  });

  // Mutation para actualizar usuario
  const updateUserMutation = useMutation({
    mutationFn: (data: UpdateUserPayload) =>
      usuariosApi.updateUsuario(userId, data),
    onSuccess: () => {
      toast.success('Usuario actualizado', {
        description: 'El usuario ha sido actualizado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      queryClient.invalidateQueries({ queryKey: ['usuario', userId] });
      setIsEditing(false);
      setIsConfirmDialogOpen(false);
      navigate({ to: '/usuarios' });
    },
    onError: (error) => {
      toast.error('Error al actualizar usuario', {
        description: error.message || 'No se pudo actualizar el usuario.',
      });
    },
  });

  // Mutation para actualizar solo onboarding
  const updateOnboardingMutation = useMutation({
    mutationFn: (onboardingData: any) =>
      usuariosApi.updateOnboardingByUserId(userId, onboardingData),
    onSuccess: () => {
      toast.success('Onboarding actualizado', {
        description:
          'Los datos de onboarding han sido actualizados exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      queryClient.invalidateQueries({ queryKey: ['usuario', userId] });
      setIsEditing(false);
      setIsConfirmDialogOpen(false);
      navigate({ to: '/usuarios' });
    },
    onError: (error) => {
      toast.error('Error al actualizar onboarding', {
        description:
          error.message || 'No se pudieron actualizar los datos de onboarding.',
      });
    },
  });

  // Mutation para crear onboarding
  const createOnboardingMutation = useMutation({
    mutationFn: (onboardingData: any) =>
      usuariosApi.createOnboardingByUserId(userId, onboardingData),
    onSuccess: () => {
      toast.success('Onboarding creado', {
        description: 'Los datos de onboarding han sido creados exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      queryClient.invalidateQueries({ queryKey: ['usuario', userId] });
      setIsEditing(false);
      setIsConfirmDialogOpen(false);
      navigate({ to: '/usuarios' });
    },
    onError: (error) => {
      toast.error('Error al crear onboarding', {
        description:
          error.message || 'No se pudieron crear los datos de onboarding.',
      });
    },
  });

  // Estados para los campos y errores
  const [form, setForm] = useState({
    nombres: '',
    primerApellido: '',
    segundoApellido: '',
    correo: '',
    celular: '',
    tipoDoc: '',
    numDoc: '',
    fechaNacimiento: '',
    genero: '',
    ciudad: '',
    codigoPostal: '',
    distrito: '',
    calle: '',
  });

  const [initialValues, setInitialValues] = useState({
    nombres: '',
    primerApellido: '',
    segundoApellido: '',
    correo: '',
    celular: '',
    tipoDoc: '',
    numDoc: '',
    fechaNacimiento: '',
    genero: '',
    ciudad: '',
    codigoPostal: '',
    distrito: '',
    calle: '',
  });

  const [errors, setErrors] = useState({
    correo: '',
    celular: '',
    tipoDoc: '',
    nombres: '',
    primerApellido: '',
  });

  const [onboardingEnabled, setOnboardingEnabled] = useState(true);
  const [originallyHadOnboarding, setOriginallyHadOnboarding] = useState(false);

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    if (user && initialValues.nombres === '') {
      // Separar el nombre completo en partes
      const nameParts = user.name.split(' ');
      const nombres = nameParts[0] || '';
      const primerApellido = nameParts[1] || '';
      const segundoApellido = nameParts.slice(2).join(' ') || '';

      // Formatear fecha de nacimiento para el input tipo date
      let fechaNacimientoFormatted = '';
      if (user.onboarding?.birthDate) {
        try {
          const date = new Date(user.onboarding.birthDate);
          fechaNacimientoFormatted = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        } catch (error) {
          console.warn('Error parsing birth date:', error);
        }
      }

      const newForm = {
        nombres,
        primerApellido,
        segundoApellido,
        correo: user.email,
        celular: user.onboarding?.phoneNumber || '',
        tipoDoc: user.onboarding?.documentType || '',
        numDoc: user.onboarding?.documentNumber || '',
        fechaNacimiento: fechaNacimientoFormatted,
        genero: user.onboarding?.gender || '',
        ciudad: user.onboarding?.city || '',
        codigoPostal: user.onboarding?.postalCode || '',
        distrito: user.onboarding?.district || '',
        calle: user.onboarding?.address || '',
      };

      setForm(newForm);
      setInitialValues(newForm);

      // Habilitar onboarding si hay datos de onboarding
      setOnboardingEnabled(!!user.onboarding);
      setOriginallyHadOnboarding(!!user.onboarding);
    }
  }, [user, initialValues.nombres]);

  // Handler para el botón Cancelar
  const handleCancel = () => {
    if (isEditing) {
      setForm(initialValues);
      setIsEditing(false);
    } else {
      navigate({ to: '/usuarios' });
    }
  };

  // Validaciones simples
  const validate = () => {
    let valid = true;
    const newErrors = {
      correo: '',
      celular: '',
      tipoDoc: '',
      nombres: '',
      primerApellido: '',
    };

    // Validar nombres
    if (!form.nombres.trim()) {
      newErrors.nombres = 'Los nombres son requeridos';
      valid = false;
    }

    // Validar primer apellido
    if (!form.primerApellido.trim()) {
      newErrors.primerApellido = 'El primer apellido es requerido';
      valid = false;
    }

    // Correo
    if (!form.correo.match(/^\S+@\S+\.\S+$/)) {
      newErrors.correo = 'Ingrese un correo válido';
      valid = false;
    }

    // Solo validar campos de onboarding si está habilitado
    if (onboardingEnabled) {
      // Celular (solo números y longitud 9-15)
      if (form.celular && !form.celular.match(/^\d{9,15}$/)) {
        newErrors.celular = 'Ingrese un número de celular válido';
        valid = false;
      }

      // Tipo de documento (solo validar si hay número de documento)
      if (form.numDoc && !form.tipoDoc) {
        newErrors.tipoDoc = 'Seleccione un tipo de documento';
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  // Handler para el submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (!validate()) return;
    setIsConfirmDialogOpen(true);
  };

  const confirmUpdate = () => {
    // Determinar qué campos han cambiado
    const basicUserFieldsChanged =
      form.nombres !== initialValues.nombres ||
      form.primerApellido !== initialValues.primerApellido ||
      form.segundoApellido !== initialValues.segundoApellido ||
      form.correo !== initialValues.correo;

    const onboardingFieldsChanged =
      form.celular !== initialValues.celular ||
      form.tipoDoc !== initialValues.tipoDoc ||
      form.numDoc !== initialValues.numDoc ||
      form.fechaNacimiento !== initialValues.fechaNacimiento ||
      form.genero !== initialValues.genero ||
      form.ciudad !== initialValues.ciudad ||
      form.codigoPostal !== initialValues.codigoPostal ||
      form.distrito !== initialValues.distrito ||
      form.calle !== initialValues.calle;

    // Preparar datos de onboarding si están habilitados
    const onboardingPayload = onboardingEnabled
      ? {
          documentType: form.tipoDoc as 'DNI' | 'FOREIGNER_CARD' | 'PASSPORT',
          documentNumber: form.numDoc,
          phoneNumber: form.celular,
          birthDate: form.fechaNacimiento,
          gender: form.genero as 'MALE' | 'FEMALE' | 'OTHER',
          city: form.ciudad,
          postalCode: form.codigoPostal,
          district: form.distrito,
          address: form.calle,
        }
      : null;

    // CASO 1: Usuario NO tenía onboarding y ahora lo está agregando
    if (!originallyHadOnboarding && onboardingEnabled) {
      console.log('Creating new onboarding for user');
      createOnboardingMutation.mutate(onboardingPayload!);
    }
    // CASO 2: Usuario SÍ tenía onboarding, solo cambios de onboarding, sin cambios básicos
    else if (
      originallyHadOnboarding &&
      onboardingFieldsChanged &&
      !basicUserFieldsChanged &&
      onboardingEnabled
    ) {
      console.log('Updating existing onboarding only');
      updateOnboardingMutation.mutate(onboardingPayload!);
    }
    // CASO 3: Cambios en datos básicos del usuario (con o sin onboarding)
    else {
      console.log('Using general user update API');
      const payload: UpdateUserPayload = {
        name: `${form.nombres} ${form.primerApellido} ${form.segundoApellido}`.trim(),
        email: form.correo,
      };

      if (onboardingEnabled && onboardingPayload) {
        payload.onboarding = onboardingPayload;
      }

      updateUserMutation.mutate(payload);
    }
  };

  // Handler para cambios en los inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin w-12 h-12" />
      </div>
    );
  }

  const hasChanges =
    form.nombres !== initialValues.nombres ||
    form.primerApellido !== initialValues.primerApellido ||
    form.segundoApellido !== initialValues.segundoApellido ||
    form.correo !== initialValues.correo ||
    form.celular !== initialValues.celular ||
    form.distrito !== initialValues.distrito ||
    form.calle !== initialValues.calle ||
    form.tipoDoc !== initialValues.tipoDoc ||
    form.numDoc !== initialValues.numDoc ||
    form.fechaNacimiento !== initialValues.fechaNacimiento ||
    form.genero !== initialValues.genero ||
    form.ciudad !== initialValues.ciudad ||
    form.codigoPostal !== initialValues.codigoPostal;

  return (
    <div className="min-h-screen bg-[#fafbfc] w-full">
      <div className="p-6 h-full">
        <HeaderDescriptor title="USUARIOS" subtitle="EDITAR USUARIO" />
        <div className="mb-4">
          <Button
            className="h-10 bg-white border border-neutral-300 text-black rounded-lg hover:bg-neutral-100 hover:border-neutral-400 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-neutral-200 shadow-sm hover:shadow-md focus:shadow-md transition-all duration-200 ease-in-out flex items-center gap-2"
            onClick={handleCancel}
          >
            <ChevronLeft className="w-5 h-5" />
            {isEditing ? 'Cancelar' : 'Volver'}
          </Button>
        </div>
        <form onSubmit={handleSubmit}>
          <Card className="mb-6 p-6">
            <h3 className="text-xl font-bold mb-4">
              Datos principales del usuario
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="nombres" className="block font-medium mb-1">
                    Nombres
                  </label>
                  <Input
                    id="nombres"
                    name="nombres"
                    value={form.nombres}
                    onChange={handleChange}
                    placeholder="Ingrese los nombres del usuario"
                    disabled={!isEditing}
                  />
                  {errors.nombres && (
                    <span className="text-red-500 text-sm">
                      {errors.nombres}
                    </span>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="primer-apellido"
                    className="block font-medium mb-1"
                  >
                    Primer apellido
                  </label>
                  <Input
                    id="primer-apellido"
                    name="primerApellido"
                    value={form.primerApellido}
                    onChange={handleChange}
                    placeholder="Ingrese el primer apellido del usuario"
                    disabled={!isEditing}
                  />
                  {errors.primerApellido && (
                    <span className="text-red-500 text-sm">
                      {errors.primerApellido}
                    </span>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="segundo-apellido"
                    className="block font-medium mb-1"
                  >
                    Segundo apellido
                  </label>
                  <Input
                    id="segundo-apellido"
                    name="segundoApellido"
                    value={form.segundoApellido}
                    onChange={handleChange}
                    placeholder="Ingrese el segundo apellido del usuario"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label htmlFor="correo" className="block font-medium mb-1">
                    Correo electrónico
                  </label>
                  <Input
                    id="correo"
                    name="correo"
                    value={form.correo}
                    onChange={handleChange}
                    placeholder="Ingrese el correo electrónico del profesional"
                    type="email"
                    disabled={!isEditing}
                  />
                  {errors.correo && (
                    <span className="text-red-500 text-sm">
                      {errors.correo}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold mb-2">Foto de perfil</label>
                <div className="flex flex-col items-center justify-center border border-neutral-300 rounded-lg h-40 mb-2 bg-white">
                  <Upload className="w-16 h-16 text-neutral-400" />
                </div>
                <Input type="file" disabled={!isEditing} />
                <span className="text-sm text-neutral-500">
                  Sin archivos seleccionados
                </span>
              </div>
            </div>
          </Card>

          {/* Toggle para habilitar/deshabilitar onboarding */}
          <div className="flex items-center gap-3 mb-4">
            <Switch
              id="onboarding-toggle"
              checked={onboardingEnabled}
              onCheckedChange={setOnboardingEnabled}
            />
            <label htmlFor="onboarding-toggle" className="font-semibold">
              Habilitar datos de onboarding
            </label>
          </div>

          {onboardingEnabled && (
            <Card className="mb-6 p-6">
              <h3 className="text-xl font-bold mb-4">Datos del onboarding</h3>
              <div className="mb-4 font-semibold">Información personal</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="celular" className="block font-medium mb-1">
                    Número de celular
                  </label>
                  <Input
                    id="celular"
                    name="celular"
                    value={form.celular}
                    onChange={handleChange}
                    placeholder="Ingrese el número de teléfono"
                    disabled={!isEditing}
                  />
                  {errors.celular && (
                    <span className="text-red-500 text-sm">
                      {errors.celular}
                    </span>
                  )}
                </div>
                <div>
                  <label htmlFor="tipo-doc" className="block font-medium mb-1">
                    Tipo de documento
                  </label>
                  <select
                    id="tipo-doc"
                    name="tipoDoc"
                    value={form.tipoDoc}
                    onChange={handleChange}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md"
                    disabled={!isEditing}
                  >
                    <option value="">Seleccione un tipo de documento</option>
                    <option value="DNI">DNI</option>
                    <option value="FOREIGNER_CARD">
                      Carnet de Extranjería
                    </option>
                    <option value="PASSPORT">Pasaporte</option>
                  </select>
                  {errors.tipoDoc && (
                    <span className="text-red-500 text-sm">
                      {errors.tipoDoc}
                    </span>
                  )}
                </div>
                <div>
                  <label htmlFor="num-doc" className="block font-medium mb-1">
                    Número de documento
                  </label>
                  <Input
                    id="num-doc"
                    name="numDoc"
                    value={form.numDoc}
                    onChange={handleChange}
                    placeholder="Ingrese el número del documento"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label
                    htmlFor="fecha-nacimiento"
                    className="block font-medium mb-1"
                  >
                    Fecha de nacimiento
                  </label>
                  <Input
                    id="fecha-nacimiento"
                    name="fechaNacimiento"
                    type="date"
                    value={form.fechaNacimiento}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label htmlFor="genero" className="block font-medium mb-1">
                    Género
                  </label>
                  <select
                    id="genero"
                    name="genero"
                    value={form.genero}
                    onChange={handleChange}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md"
                    disabled={!isEditing}
                  >
                    <option value="">Seleccione un género</option>
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Femenino</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>
              </div>
              <div className="mb-4 font-semibold">Dirección</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="ciudad" className="block font-medium mb-1">
                    Ciudad
                  </label>
                  <Input
                    id="ciudad"
                    name="ciudad"
                    value={form.ciudad}
                    onChange={handleChange}
                    placeholder="Ingrese la ciudad"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label
                    htmlFor="codigo-postal"
                    className="block font-medium mb-1"
                  >
                    Código postal
                  </label>
                  <Input
                    id="codigo-postal"
                    name="codigoPostal"
                    value={form.codigoPostal}
                    onChange={handleChange}
                    placeholder="Ingrese el código postal"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label htmlFor="distrito" className="block font-medium mb-1">
                    Distrito
                  </label>
                  <Input
                    id="distrito"
                    name="distrito"
                    value={form.distrito}
                    onChange={handleChange}
                    placeholder="Seleccione un distrito"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label htmlFor="calle" className="block font-medium mb-1">
                    Calle/ Avenida
                  </label>
                  <Input
                    id="calle"
                    name="calle"
                    value={form.calle}
                    onChange={handleChange}
                    placeholder="Núm"
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </Card>
          )}
          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={handleCancel}>
              {isEditing ? 'Cancelar' : 'Volver'}
            </Button>
            <Button
              variant="default"
              type="submit"
              disabled={
                updateUserMutation.isPending ||
                updateOnboardingMutation.isPending ||
                createOnboardingMutation.isPending ||
                (isEditing && !hasChanges)
              }
            >
              {updateUserMutation.isPending ||
              updateOnboardingMutation.isPending ||
              createOnboardingMutation.isPending
                ? 'Guardando...'
                : isEditing
                  ? 'Guardar'
                  : 'Editar'}
            </Button>
          </div>
        </form>
      </div>

      {/* Diálogo de confirmación */}
      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Estás seguro que deseas guardar los cambios?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción actualizará la información del usuario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="default" onClick={confirmUpdate}>
                Confirmar
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default EditarUsuario;
