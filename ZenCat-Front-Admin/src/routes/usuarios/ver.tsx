import React, { useState, useEffect, useMemo } from 'react';
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

export const Route = createFileRoute('/usuarios/ver')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      id: search.id as string,
    };
  },
  component: VerUsuario,
});

function VerUsuario() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const search = useSearch({ from: '/usuarios/ver' });
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
      toast.success('Usuario Actualizado', {
        description: 'El usuario ha sido actualizado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      queryClient.invalidateQueries({ queryKey: ['usuario', userId] });
      setIsEditing(false);
      setIsConfirmDialogOpen(false);
      navigate({ to: '/usuarios' });
    },
    onError: (error) => {
      toast.error('Error al Actualizar Usuario', {
        description: error.message || 'No se pudo actualizar el usuario.',
      });
    },
  });

  // Mutation para actualizar solo onboarding
  const updateOnboardingMutation = useMutation({
    mutationFn: (onboardingData: any) =>
      usuariosApi.updateOnboardingByUserId(userId, onboardingData),
    onSuccess: () => {
      toast.success('Onboarding Actualizado', {
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
      toast.error('Error al Actualizar Onboarding', {
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
      toast.success('Onboarding Creado', {
        description: 'Los datos de onboarding han sido creados exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      queryClient.invalidateQueries({ queryKey: ['usuario', userId] });
      setIsEditing(false);
      setIsConfirmDialogOpen(false);
      navigate({ to: '/usuarios' });
    },
    onError: (error) => {
      toast.error('Error al Crear Onboarding', {
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
    region: '',
    provincia: '',
    distrito: '',
    codigoPostal: '',
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
    nombres: '',
    primerApellido: '',
    numDoc: '',
    fechaNacimiento: '',
    region: '',
    provincia: '',
    distrito: '',
  });

  const [onboardingEnabled, setOnboardingEnabled] = useState(false);
  const [originallyHadOnboarding, setOriginallyHadOnboarding] = useState(false);

  const selectedRegion = useMemo(() => 
    regiones.find(region => region.id === form.region),
    [regiones, form.region]
  );

  const selectedProvincia = useMemo(() => 
    provincias.find(prov => prov.id === form.provincia),
    [provincias, form.provincia]
  );

  const provinciasFiltradas = useMemo(() => {
    if (!selectedRegion) return provincias;
    return provincias.filter(prov => prov.department_id === selectedRegion.id);
  }, [provincias, selectedRegion]);

  const distritosFiltrados = useMemo(() => {
    const distritoActual = form.distrito ? distritos.find(d => d.id === form.distrito) : null;
    let filtrados: Distrito[] = [];
    
    if (!selectedRegion && !selectedProvincia) {
      filtrados = distritos;
    } else if (selectedRegion && !selectedProvincia) {
      filtrados = distritos.filter(dist => dist.department_id === selectedRegion.id);
    } else if (selectedRegion && selectedProvincia) {
      filtrados = distritos.filter(
        dist => dist.department_id === selectedRegion.id && dist.province_id === selectedProvincia.id
      );
    }

    if (distritoActual && !filtrados.find(d => d.id === distritoActual.id)) {
      filtrados = [distritoActual, ...filtrados];
    }
    
    return filtrados;
  }, [distritos, selectedRegion, selectedProvincia, form.distrito]);

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      const nameParts = user.name.split(' ');
      const nombres = nameParts[0] || '';
      const primerApellido = nameParts[1] || '';
      const segundoApellido = nameParts.slice(2).join(' ') || '';

      let fechaNacimientoFormatted = '';
      if (user.onboarding?.birthDate) {
        try {
          fechaNacimientoFormatted = new Date(user.onboarding.birthDate).toISOString().split('T')[0];
        } catch (error) {
          console.warn('Error parsing birth date:', error);
        }
      }

      // Convert geographic names from backend to IDs for the form
      const regionId = user.onboarding?.region ? regiones.find(r => r.name === user.onboarding?.region)?.id || '' : '';
      const provinciaId = user.onboarding?.province ? provincias.find(p => p.name === user.onboarding?.province)?.id || '' : '';
      const distritoId = user.onboarding?.district ? distritos.find(d => d.name === user.onboarding?.district)?.id || '' : '';

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
        region: regionId,
        provincia: provinciaId,
        distrito: distritoId,
        codigoPostal: user.onboarding?.postalCode || '',
        calle: user.onboarding?.address || '',
      };

      setForm(newForm);
      setInitialValues(newForm);
      
      // Enable onboarding section if user has any onboarding data
      const hasOnboardingData = !!user.onboarding;
      setOnboardingEnabled(hasOnboardingData);
      setOriginallyHadOnboarding(hasOnboardingData);
      
      console.log('User onboarding data loaded:', {
        hasOnboarding: hasOnboardingData,
        region: user.onboarding?.region,
        province: user.onboarding?.province,
        district: user.onboarding?.district,
        convertedIds: { regionId, provinciaId, distritoId }
      });
    }
  }, [user, regiones, provincias, distritos]);

  // Handlers
  const handleCancel = () => {
    if (isEditing) {
      setForm(initialValues);
      setErrors({
        correo: '', celular: '', tipoDoc: '', nombres: '', primerApellido: '', numDoc: '',
        fechaNacimiento: '', region: '', provincia: '', distrito: ''
      });
      setIsEditing(false);
    } else {
      navigate({ to: '/usuarios' });
    }
  };

  const validate = () => {
    let valid = true;
    const newErrors = {
      correo: '', celular: '', tipoDoc: '', nombres: '', primerApellido: '', numDoc: '',
      fechaNacimiento: '', region: '', provincia: '', distrito: ''
    };

    if (!form.nombres.trim()) { newErrors.nombres = 'Los nombres son requeridos'; valid = false; }
    if (!form.primerApellido.trim()) { newErrors.primerApellido = 'El primer apellido es requerido'; valid = false; }
    if (!form.correo.match(/^\S+@\S+\.\S+$/)) { newErrors.correo = 'Ingrese un correo válido'; valid = false; }

    if (onboardingEnabled) {
      if (form.celular && !form.celular.match(/^\d{9,15}$/)) { newErrors.celular = 'Ingrese un número de celular válido'; valid = false; }
      if (form.numDoc && !form.tipoDoc) { newErrors.tipoDoc = 'Seleccione un tipo de documento'; valid = false; }
      if (form.tipoDoc === 'DNI' && !form.numDoc.match(/^\d{8}$/)) { newErrors.numDoc = 'El DNI debe tener 8 dígitos'; valid = false; }
      if (form.tipoDoc === 'FOREIGNER_CARD' && !form.numDoc.match(/^\d{9}$/)) { newErrors.numDoc = 'El Carnet de Extranjería debe tener 9 dígitos'; valid = false; }
      if (form.tipoDoc === 'PASSPORT' && !form.numDoc.match(/^[A-Za-z0-9]{6,12}$/)) { newErrors.numDoc = 'El Pasaporte debe tener entre 6 y 12 caracteres alfanuméricos'; valid = false; }
      if (!form.fechaNacimiento.trim()) { newErrors.fechaNacimiento = 'La fecha de nacimiento es obligatoria'; valid = false; }
      const birthDate = new Date(form.fechaNacimiento);
      if (isNaN(birthDate.getTime()) || birthDate > new Date() || birthDate < new Date('1900-01-01')) { newErrors.fechaNacimiento = 'Ingrese una fecha válida'; valid = false; }
      
      // Validar región
      if (!form.region.trim()) {
        newErrors.region = 'Seleccione una región';
        valid = false;
      } else {
        // Verify the region ID exists
        const regionExists = regiones.find(r => r.id === form.region);
        if (!regionExists) {
          newErrors.region = 'Región seleccionada no válida';
          valid = false;
        }
      }

      // Validar provincia
      if (!form.provincia.trim()) {
        newErrors.provincia = 'Seleccione una provincia';
        valid = false;
      } else {
        // Verify the province ID exists and belongs to the selected region
        const provinceExists = provincias.find(p => p.id === form.provincia && p.department_id === form.region);
        if (!provinceExists) {
          newErrors.provincia = 'Provincia seleccionada no válida';
          valid = false;
        }
      }

      // Validar distrito
      if (!form.distrito.trim()) {
        newErrors.distrito = 'Seleccione un distrito';
        valid = false;
      } else {
        // Verify the district ID exists and belongs to the selected province and region
        const districtExists = distritos.find(d => d.id === form.distrito && d.department_id === form.region && d.province_id === form.provincia);
        if (!districtExists) {
          newErrors.distrito = 'Distrito seleccionado no válido';
          valid = false;
        }
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;
    if (!validate()) return;
    setIsConfirmDialogOpen(true);
  };

  const confirmUpdate = async () => {
    const basicUserFieldsChanged = form.nombres !== initialValues.nombres || form.primerApellido !== initialValues.primerApellido || form.segundoApellido !== initialValues.segundoApellido || form.correo !== initialValues.correo;
    const onboardingFieldsChanged = form.celular !== initialValues.celular || form.tipoDoc !== initialValues.tipoDoc || form.numDoc !== initialValues.numDoc || form.fechaNacimiento !== initialValues.fechaNacimiento || form.genero !== initialValues.genero || form.region !== initialValues.region || form.provincia !== initialValues.provincia || form.codigoPostal !== initialValues.codigoPostal || form.distrito !== initialValues.distrito || form.calle !== initialValues.calle;

    // Convert IDs back to names for the API
    const regionName = form.region ? regiones.find(r => r.id === form.region)?.name || '' : '';
    const provinciaName = form.provincia ? provincias.find(p => p.id === form.provincia)?.name || '' : '';
    const distritoName = form.distrito ? distritos.find(d => d.id === form.distrito)?.name || '' : '';

    const onboardingPayload = onboardingEnabled ? {
      documentType: form.tipoDoc as 'DNI' | 'FOREIGNER_CARD' | 'PASSPORT',
      documentNumber: form.numDoc, phoneNumber: form.celular, birthDate: form.fechaNacimiento,
      gender: form.genero as 'MALE' | 'FEMALE' | 'OTHER', region: regionName, province: provinciaName,
      postalCode: form.codigoPostal, district: distritoName, address: form.calle,
    } : null;

    try {
      if (!originallyHadOnboarding && onboardingEnabled) {
        if (basicUserFieldsChanged) {
          await updateUserMutation.mutateAsync({ name: `${form.nombres} ${form.primerApellido} ${form.segundoApellido}`.trim(), email: form.correo });
        }
        createOnboardingMutation.mutate(onboardingPayload!);
      } else if (originallyHadOnboarding && onboardingFieldsChanged && !basicUserFieldsChanged && onboardingEnabled) {
        updateOnboardingMutation.mutate(onboardingPayload!);
      } else if (basicUserFieldsChanged) {
        const userPayload: UpdateUserPayload = { name: `${form.nombres} ${form.primerApellido} ${form.segundoApellido}`.trim(), email: form.correo };
        if (onboardingFieldsChanged && onboardingEnabled && originallyHadOnboarding) {
          await updateUserMutation.mutateAsync(userPayload);
          updateOnboardingMutation.mutate(onboardingPayload!);
        } else {
          updateUserMutation.mutate(userPayload);
        }
      } else if (onboardingFieldsChanged && onboardingEnabled && originallyHadOnboarding) {
        updateOnboardingMutation.mutate(onboardingPayload!);
      }
    } catch (error) {
      toast.error('Error al actualizar', { description: 'Ocurrió un error durante la actualización.' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleRegionChange = (value: string) => { 
    if (value !== form.region) {
      setForm({ ...form, region: value, provincia: '', distrito: '' });
      // Clear related errors
      setErrors((prev) => ({ ...prev, region: '', provincia: '', distrito: '' }));
    }
  };
  const handleProvinciaChange = (value: string) => { 
    if (value !== form.provincia) {
      setForm({ ...form, provincia: value, distrito: '' });
      // Clear related errors
      setErrors((prev) => ({ ...prev, provincia: '', distrito: '' }));
    }
  };
  const handleDistritoChange = (value: string) => {
    setForm({ ...form, distrito: value });
    // Clear error
    setErrors((prev) => ({ ...prev, distrito: '' }));
  };

  if (isLoading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin w-12 h-12" /></div>;

  const hasChanges = (Object.keys(form) as Array<keyof typeof form>).some(key => form[key] !== initialValues[key]);

  return (
    <div className="min-h-screen bg-[#fafbfc] w-full">
      <div className="p-6 h-full">
        <HeaderDescriptor title="USUARIOS" subtitle={isEditing ? "EDITAR USUARIO" : "VER USUARIO"} />
        <div className="mb-4">
          <Button className="h-10 bg-white border border-neutral-300 text-black rounded-lg hover:bg-black hover:text-white hover:border-black hover:shadow-sm active:scale-95 transition-all duration-200" onClick={() => navigate({ to: '/usuarios' })}>
            <ChevronLeft className="w-5 h-5 mr-2" />
            Volver
          </Button>
        </div>
        <form onSubmit={handleSubmit}>
          <Card className="mb-6 p-6">
            <h3 className="text-xl font-bold mb-4">Datos principales del usuario</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="nombres" className="block font-medium mb-1">Nombres</label>
                  <Input id="nombres" name="nombres" value={form.nombres} onChange={handleChange} placeholder="Ingrese los nombres del usuario" disabled={!isEditing} />
                  {errors.nombres && <span className="text-red-500 text-sm">{errors.nombres}</span>}
                </div>
                <div>
                  <label htmlFor="primer-apellido" className="block font-medium mb-1">Primer apellido</label>
                  <Input id="primer-apellido" name="primerApellido" value={form.primerApellido} onChange={handleChange} placeholder="Ingrese el primer apellido del usuario" disabled={!isEditing} />
                  {errors.primerApellido && <span className="text-red-500 text-sm">{errors.primerApellido}</span>}
                </div>
                <div>
                  <label htmlFor="segundo-apellido" className="block font-medium mb-1">Segundo apellido</label>
                  <Input id="segundo-apellido" name="segundoApellido" value={form.segundoApellido} onChange={handleChange} placeholder="Ingrese el segundo apellido del usuario" disabled={!isEditing} />
                </div>
                <div>
                  <label htmlFor="correo" className="block font-medium mb-1">Correo electrónico</label>
                  <Input id="correo" name="correo" value={form.correo} onChange={handleChange} placeholder="Ingrese el correo electrónico" type="email" disabled={!isEditing} />
                  {errors.correo && <span className="text-red-500 text-sm">{errors.correo}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold mb-2">Foto de perfil</label>
                <div className="flex flex-col items-center justify-center border border-neutral-300 rounded-lg h-40 mb-2 bg-white">
                  <Upload className="w-16 h-16 text-neutral-400" />
                </div>
                <Input type="file" disabled={!isEditing} />
                <span className="text-sm text-neutral-500">Sin archivos seleccionados</span>
              </div>
            </div>
          </Card>

          <div className="flex items-center gap-3 mb-4">
            <Switch id="onboarding-toggle" checked={onboardingEnabled} onCheckedChange={setOnboardingEnabled} />
            <label htmlFor="onboarding-toggle" className="font-semibold">Habilitar datos de onboarding</label>
          </div>

          {onboardingEnabled && (
            <Card className="mb-6 p-6">
              <h3 className="text-xl font-bold mb-4">Datos del onboarding</h3>
              <div className="mb-4 font-semibold">Información personal</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="celular" className="block font-medium mb-1">Número de celular</label>
                  <Input id="celular" name="celular" value={form.celular} onChange={handleChange} placeholder="Ingrese el número de teléfono" disabled={!isEditing} />
                  {errors.celular && <span className="text-red-500 text-sm">{errors.celular}</span>}
                </div>
                <div>
                  <label htmlFor="tipo-doc" className="block font-medium mb-1">Tipo de documento</label>
                  <select id="tipo-doc" name="tipoDoc" value={form.tipoDoc} onChange={handleChange} className="w-full h-10 px-3 border border-gray-300 rounded-md" disabled={!isEditing}>
                    <option value="">Seleccione un tipo</option>
                    <option value="DNI">DNI</option>
                    <option value="FOREIGNER_CARD">Carnet de Extranjería</option>
                    <option value="PASSPORT">Pasaporte</option>
                  </select>
                  {errors.tipoDoc && <span className="text-red-500 text-sm">{errors.tipoDoc}</span>}
                </div>
                <div>
                  <label htmlFor="num-doc" className="block font-medium mb-1">Número de documento</label>
                  <Input id="num-doc" name="numDoc" value={form.numDoc} onChange={handleChange} placeholder="Ingrese el número del documento" disabled={!isEditing} />
                  {errors.numDoc && <span className="text-red-500 text-sm">{errors.numDoc}</span>}
                </div>
                <div>
                  <label htmlFor="fecha-nacimiento" className="block font-medium mb-1">Fecha de nacimiento</label>
                  <Input id="fecha-nacimiento" name="fechaNacimiento" type="date" value={form.fechaNacimiento} onChange={handleChange} disabled={!isEditing} />
                  {errors.fechaNacimiento && <span className="text-red-500 text-sm">{errors.fechaNacimiento}</span>}
                </div>
                <div>
                  <label htmlFor="genero" className="block font-medium mb-1">Género</label>
                  <select id="genero" name="genero" value={form.genero} onChange={handleChange} className="w-full h-10 px-3 border border-gray-300 rounded-md" disabled={!isEditing}>
                    <option value="">Seleccione un género</option>
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Femenino</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>
              </div>
              <div className="mb-4 font-semibold">Dirección</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="region" className="block font-medium mb-1">Región / Departamento</label>
                  <Select value={form.region} onValueChange={handleRegionChange} disabled={!isEditing}>
                    <SelectTrigger><SelectValue placeholder="Seleccione una región" /></SelectTrigger>
                    <SelectContent>{regiones.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.region && <span className="text-red-500 text-sm">{errors.region}</span>}
                </div>
                <div>
                  <label htmlFor="provincia" className="block font-medium mb-1">Provincia</label>
                  <Select value={form.provincia} onValueChange={handleProvinciaChange} disabled={!isEditing || !form.region}>
                    <SelectTrigger><SelectValue placeholder="Seleccione una provincia" /></SelectTrigger>
                    <SelectContent>{provinciasFiltradas.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.provincia && <span className="text-red-500 text-sm">{errors.provincia}</span>}
                </div>
                <div>
                  <label htmlFor="distrito" className="block font-medium mb-1">Distrito</label>
                  <Select value={form.distrito} onValueChange={handleDistritoChange} disabled={!isEditing || !form.provincia}>
                    <SelectTrigger><SelectValue placeholder="Seleccione un distrito" /></SelectTrigger>
                    <SelectContent>{distritosFiltrados.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.distrito && <span className="text-red-500 text-sm">{errors.distrito}</span>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="codigo-postal" className="block font-medium mb-1">Código postal</label>
                  <Input id="codigo-postal" name="codigoPostal" value={form.codigoPostal} onChange={handleChange} placeholder="Ingrese el código postal" disabled={!isEditing} />
                </div>
                <div>
                  <label htmlFor="calle" className="block font-medium mb-1">Calle/ Avenida</label>
                  <Input id="calle" name="calle" value={form.calle} onChange={handleChange} placeholder="Ingrese la dirección completa" disabled={!isEditing} />
                </div>
              </div>
            </Card>
          )}
          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={isEditing ? () => {
              setForm(initialValues);
              setErrors({
                correo: '', celular: '', tipoDoc: '', nombres: '', primerApellido: '', numDoc: '',
                fechaNacimiento: '', region: '', provincia: '', distrito: ''
              });
              setIsEditing(false);
            } : () => navigate({ to: '/usuarios' })}>
              {isEditing ? 'Cancelar' : 'Volver'}
            </Button>
            <Button variant="default" type="submit" disabled={isEditing && (!hasChanges || updateUserMutation.isPending || updateOnboardingMutation.isPending || createOnboardingMutation.isPending)} onClick={() => { if (!isEditing) setIsEditing(true); }}>
              {isEditing ? (updateUserMutation.isPending || updateOnboardingMutation.isPending || createOnboardingMutation.isPending ? 'Guardando...' : 'Guardar') : 'Editar'}
            </Button>
          </div>
        </form>
      </div>
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro que deseas guardar los cambios?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción actualizará la información del usuario.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmDialogOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction asChild><Button variant="default" onClick={confirmUpdate}>Confirmar</Button></AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default VerUsuario;