import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { authApi } from '@/api/auth/auth';
import { ChevronLeft } from 'lucide-react';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosApi } from '@/api/usuarios/usuarios';
import { CreateUserPayload } from '@/types/user';
import { ModalNotifications } from '@/components/custom/common/modal-notifications';
import { useModalNotifications } from '@/hooks/use-modal-notifications';
import { useToast } from '@/context/ToastContext';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import rawRegiones from '@/types/ubigeo_peru_2016_departamentos.json';
import rawProvincias from '@/types/ubigeo_peru_2016_provincias.json';
import rawDistritos from '@/types/ubigeo_peru_2016_distritos.json';
import { Region, Provincia, Distrito } from '@/types/local';

const regiones: Region[] = rawRegiones;
const provincias: Provincia[] = rawProvincias;
const distritos: Distrito[] = rawDistritos;

export const Route = createFileRoute('/usuarios/agregar')({
  beforeLoad: async () => {
    try {
      const user = await authApi.getCurrentUser();
      return { user };
    } catch (error) {
      console.error('Error en beforeLoad:', error);
      throw redirect({
        to: '/login',
      });
    }
  },
  component: AgregarUsuario,
});

function AgregarUsuario() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { modal, error, closeModal } = useModalNotifications();
  const toast = useToast();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

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
    region: '',
    provincia: '',
    distrito: '',
    codigoPostal: '',
    calle: '',
  });

  const [errors, setErrors] = useState({
    correo: '',
    celular: '',
    tipoDoc: '',
    numDoc: '',
    nombres: '',
    primerApellido: '',
    fechaNacimiento: '',
    region: '',
    provincia: '',
    distrito: '',
  });

  const [onboardingEnabled, setOnboardingEnabled] = useState(true);

  // Cálculos para los dropdowns de ubigeo - usando IDs únicos
  const selectedRegion = regiones.find(region => region.id === form.region);
  const selectedProvincia = provincias.find(prov => prov.id === form.provincia);

  const provinciasFiltradas = provincias.filter(
    prov => prov.department_id === selectedRegion?.id
  );

  const distritosFiltrados = distritos.filter(
    dist => dist.department_id === selectedRegion?.id && dist.province_id === selectedProvincia?.id
  );

  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserPayload) =>
      usuariosApi.createUsuario(data),
    onSuccess: () => {
      toast.success('Usuario Creado', {
        description: 'El usuario ha sido agregado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      navigate({ to: '/usuarios' });
    },
    onError: (err) => {
      toast.error('Error al crear usuario', {
        description: err.message || 'No se pudo crear el usuario.',
      });
    },
  });

  // Handler para el botón Cancelar
  const handleCancel = () => {
    navigate({ to: '/usuarios' });
  };

  // Validaciones simples
  const validate = () => {
    let valid = true;
    const newErrors = {
      correo: '',
      celular: '',
      tipoDoc: '',
      numDoc: '',
      nombres: '',
      primerApellido: '',
      fechaNacimiento: '',
      region: '',
      provincia: '',
      distrito: '',
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

    // Solo validar onboarding fields si el onboarding está habilitado
    if (onboardingEnabled) {
      // Celular (solo números y longitud 9-15)
      if (form.celular && !form.celular.match(/^\d{9,15}$/)) {
        newErrors.celular = 'Ingrese un número de celular válido';
        valid = false;
      }

      // Tipo de documento
      if (!form.tipoDoc) {
        newErrors.tipoDoc = 'Seleccione un tipo de documento';
        valid = false;
      }

      // Número de documento
      if (!form.numDoc.trim()) {
        newErrors.numDoc = 'El número de documento es requerido';
        valid = false;
      } else {
        // Validar formato según tipo
        if (form.tipoDoc === 'DNI' && !form.numDoc.match(/^\d{8}$/)) {
          newErrors.numDoc = 'El DNI debe tener 8 dígitos';
          valid = false;
        } else if (form.tipoDoc === 'FOREIGNER_CARD' && !form.numDoc.match(/^\d{9}$/)) {
          newErrors.numDoc = 'El Carnet de Extranjería debe tener 9 dígitos';
          valid = false;
        } else if (form.tipoDoc === 'PASSPORT' && !form.numDoc.match(/^[A-Za-z0-9]{6,12}$/)) {
          newErrors.numDoc = 'El Pasaporte debe tener entre 6 y 12 caracteres alfanuméricos';
          valid = false;
        }
      }

      // Validación de fecha de nacimiento (obligatorio si el onboarding está habilitado)
      if (!form.fechaNacimiento.trim()) {
        newErrors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
        valid = false;
      } else {
        const birthDate = new Date(form.fechaNacimiento);
        if (isNaN(birthDate.getTime()) || birthDate > new Date() || birthDate < new Date('1900-01-01')) {
          newErrors.fechaNacimiento = 'Ingrese una fecha válida';
          valid = false;
        }
      }

      // Validaciones de ubicación geográfica
      if (form.region && !form.provincia) {
        newErrors.provincia = 'Seleccione una provincia';
        valid = false;
      }

      if (form.provincia && !form.distrito) {
        newErrors.distrito = 'Seleccione un distrito';
        valid = false;
      }

      // Validar región
      if (form.region && !regiones.find(r => r.id === form.region)) {
        newErrors.region = 'Región seleccionada no válida';
        valid = false;
      }

      // Validar provincia
      if (form.provincia && !provincias.find(p => p.id === form.provincia && p.department_id === form.region)) {
        newErrors.provincia = 'Provincia seleccionada no válida';
        valid = false;
      }

      // Validar distrito
      if (form.distrito && !distritos.find(d => d.id === form.distrito && d.department_id === form.region && d.province_id === form.provincia)) {
        newErrors.distrito = 'Distrito seleccionado no válido';
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  // Handler para el submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsConfirmDialogOpen(true);
  };

  const confirmCreate = () => {
    // Convert IDs back to names for the API
    const regionName = form.region ? regiones.find(r => r.id === form.region)?.name || '' : '';
    const provinciaName = form.provincia ? provincias.find(p => p.id === form.provincia)?.name || '' : '';
    const distritoName = form.distrito ? distritos.find(d => d.id === form.distrito)?.name || '' : '';

    const payload: CreateUserPayload = {
      name: `${form.nombres} ${form.primerApellido} ${form.segundoApellido}`.trim(),
      email: form.correo,
      rol: 'user',
      password: '123456', // Contraseña por defecto
      permissions: ['read'],
      avatar: '',
    };

    if (onboardingEnabled) {
      // Solo agregar datos en el objeto onboarding, no duplicarlos en el nivel raíz
      payload.onboarding = {
        documentType: form.tipoDoc as 'DNI' | 'FOREIGNER_CARD' | 'PASSPORT',
        documentNumber: form.numDoc,
        phoneNumber: form.celular,
        birthDate: form.fechaNacimiento,
        gender: form.genero as 'MALE' | 'FEMALE' | 'OTHER',
        region: regionName,
        province: provinciaName,
        postalCode: form.codigoPostal,
        district: distritoName,
        address: form.calle,
      };
    }

    createUserMutation.mutate(payload);
  };

  // Handler para cambios en los inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error for the field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handlers específicos para los dropdowns de ubigeo
  const handleRegionChange = (value: string) => {
    setForm({
      ...form,
      region: value,
      provincia: '', // Reset provincia cuando cambia región
      distrito: '', // Reset distrito cuando cambia región
    });
    // Clear related errors
    setErrors((prev) => ({ ...prev, region: '', provincia: '', distrito: '' }));
  };

  const handleProvinciaChange = (value: string) => {
    setForm({
      ...form,
      provincia: value,
      distrito: '', // Reset distrito cuando cambia provincia
    });
    // Clear related errors
    setErrors((prev) => ({ ...prev, provincia: '', distrito: '' }));
  };

  const handleDistritoChange = (value: string) => {
    setForm({ ...form, distrito: value });
    // Clear error
    setErrors((prev) => ({ ...prev, distrito: '' }));
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] w-full">
      <div className="p-6 h-full">
        <HeaderDescriptor title="USUARIOS" subtitle="AGREGAR USUARIO" />
        <div className="mb-4">
          <Button
            className="h-10 bg-white border border-neutral-300 text-black rounded-lg hover:bg-black hover:text-white hover:border-black hover:shadow-sm active:scale-95 transition-all duration-200 flex items-center gap-2"
            onClick={() => navigate({ to: '/usuarios' })}
          >
            <ChevronLeft className="w-5 h-5" />
            Volver
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
                <Input type="file" />
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
                  />
                  {errors.numDoc && (
                    <span className="text-red-500 text-sm">
                      {errors.numDoc}
                    </span>
                  )}
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
                  />
                  {errors.fechaNacimiento && (
                    <span className="text-red-500 text-sm">
                      {errors.fechaNacimiento}
                    </span>
                  )}
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
                  <label htmlFor="region" className="block font-medium mb-1">
                    Región
                  </label>
                                     <Select
                     value={form.region}
                     onValueChange={handleRegionChange}
                   >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione una región" />
                    </SelectTrigger>
                    <SelectContent>
                      {regiones.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.region && (
                    <span className="text-red-500 text-sm">
                      {errors.region}
                    </span>
                  )}
                </div>
                <div>
                  <label htmlFor="provincia" className="block font-medium mb-1">
                    Provincia
                  </label>
                                     <Select
                     value={form.provincia}
                     onValueChange={handleProvinciaChange}
                   >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione una provincia" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinciasFiltradas.map((prov) => (
                        <SelectItem key={prov.id} value={prov.id}>
                          {prov.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.provincia && (
                    <span className="text-red-500 text-sm">
                      {errors.provincia}
                    </span>
                  )}
                </div>
                <div>
                  <label htmlFor="distrito" className="block font-medium mb-1">
                    Distrito
                  </label>
                                     <Select
                     value={form.distrito}
                     onValueChange={handleDistritoChange}
                   >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un distrito" />
                    </SelectTrigger>
                    <SelectContent>
                      {distritosFiltrados.map((dist) => (
                        <SelectItem key={dist.id} value={dist.id}>
                          {dist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.distrito && (
                    <span className="text-red-500 text-sm">
                      {errors.distrito}
                    </span>
                  )}
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
                  />
                </div>
              </div>
            </Card>
          )}
          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button variant="default" type="submit">
              Guardar
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
              ¿Estás seguro que deseas crear el usuario?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción creará un nuevo usuario en el sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="default" onClick={confirmCreate}>
                Confirmar
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ModalNotifications modal={modal} onClose={closeModal} />
    </div>
  );
}

export default AgregarUsuario;
