import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { User } from "@/types/user";
import { authApi } from "@/api/auth/auth";
import { RouterContext } from "@/types/router";
import { Plus, ChevronLeft } from "lucide-react";
import HeaderDescriptor from '@/components/common/header-descriptor';
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute('/usuarios/editar')({
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
  component: EditarUsuario,
});

function EditarUsuario() {
  const navigate = useNavigate()

  // Estados para los campos y errores
  const [form, setForm] = useState({
    nombres: '',
    primerApellido: '',
    segundoApellido: '',
    correo: '',
    celular: '',
    tipoDoc: '',
    numDoc: '',
    // ... otros campos si es necesario
  });
  const [errors, setErrors] = useState({
    correo: '',
    celular: '',
    tipoDoc: '',
  });
  const [onboardingEnabled, setOnboardingEnabled] = useState(true);

  // Handler para el botón Cancelar
  const handleCancel = () => {
    navigate({ to: '/usuarios' });
  };

  // Validaciones simples
  const validate = () => {
    let valid = true;
    const newErrors: typeof errors = { correo: '', celular: '', tipoDoc: '' };
    // Correo
    if (!form.correo.match(/^\S+@\S+\.\S+$/)) {
      newErrors.correo = 'Ingrese un correo válido';
      valid = false;
    }
    // Celular (solo números y longitud 9-15)
    if (!form.celular.match(/^\d{9,15}$/)) {
      newErrors.celular = 'Ingrese un número de celular válido';
      valid = false;
    }
    // Tipo de documento
    if (!form.tipoDoc) {
      newErrors.tipoDoc = 'Seleccione un tipo de documento';
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  // Handler para el submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // Aquí iría la lógica de guardado
    // navigate({ to: '/usuarios' }); // Descomentar si quieres redirigir tras guardar
  };

  // Handler para cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] w-full">
      <div className="p-6 h-full">
        <HeaderDescriptor title="USUARIOS" subtitle="EDITAR USUARIO" />
        <div className="mb-4">
          <Button
            variant="outline"
            className="flex items-center gap-2 border rounded-lg px-4 py-2 bg-white shadow font-semibold hover:bg-neutral-100"
            onClick={() => navigate({ to: '/usuarios' })}
          >
            <ChevronLeft className="w-5 h-5" />
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
                  <Input id="nombres" name="nombres" value={form.nombres} onChange={handleChange} placeholder="Ingrese los nombres del usuario" />
                </div>
                <div>
                  <label htmlFor="primer-apellido" className="block font-medium mb-1">Primer apellido</label>
                  <Input id="primer-apellido" name="primerApellido" value={form.primerApellido} onChange={handleChange} placeholder="Ingrese el primer apellido del usuario" />
                </div>
                <div>
                  <label htmlFor="segundo-apellido" className="block font-medium mb-1">Segundo apellido</label>
                  <Input id="segundo-apellido" name="segundoApellido" value={form.segundoApellido} onChange={handleChange} placeholder="Ingrese el segundo apellido del usuario" />
                </div>
                <div>
                  <label htmlFor="correo" className="block font-medium mb-1">Correo electrónico</label>
                  <Input id="correo" name="correo" value={form.correo} onChange={handleChange} placeholder="Ingrese el correo electrónico del profesional" type="email" />
                  {errors.correo && <span className="text-red-500 text-sm">{errors.correo}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold mb-2">Foto de perfil</label>
                <div className="flex flex-col items-center justify-center border border-neutral-300 rounded-lg h-40 mb-2 bg-white">
                  <Upload className="w-16 h-16 text-neutral-400" />
                </div>
                <Input type="file" />
                <span className="text-sm text-neutral-500">Sin archivos seleccionados</span>
              </div>
            </div>
          </Card>

          {/* Toggle para habilitar/deshabilitar onboarding */}
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
                  <Input id="celular" name="celular" value={form.celular} onChange={handleChange} placeholder="Ingrese el número de teléfono" />
                  {errors.celular && <span className="text-red-500 text-sm">{errors.celular}</span>}
                </div>
                <div>
                  <label htmlFor="tipo-doc" className="block font-medium mb-1">Tipo de documento</label>
                  <select id="tipo-doc" name="tipoDoc" value={form.tipoDoc} onChange={handleChange} className="w-full h-10 px-3 border border-gray-300 rounded-md">
                    <option value="">Seleccione un tipo de documento</option>
                    <option value="DNI">DNI</option>
                    <option value="Foreign Card">Foreign Card</option>
                  </select>
                  {errors.tipoDoc && <span className="text-red-500 text-sm">{errors.tipoDoc}</span>}
                </div>
                <div>
                  <label htmlFor="num-doc" className="block font-medium mb-1">Número de documento</label>
                  <Input id="num-doc" name="numDoc" value={form.numDoc} onChange={handleChange} placeholder="Ingrese el número del documento" />
                </div>
              </div>
              <div className="mb-4 font-semibold">Dirección</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="region" className="block font-medium mb-1">Región</label>
                  <Input id="region" placeholder="Seleccione una región" />
                </div>
                <div>
                  <label htmlFor="provincia" className="block font-medium mb-1">Provincia</label>
                  <Input id="provincia" placeholder="Seleccione una provincia" />
                </div>
                <div>
                  <label htmlFor="distrito" className="block font-medium mb-1">Distrito</label>
                  <Input id="distrito" placeholder="Seleccione un distrito" />
                </div>
                <div>
                  <label htmlFor="calle" className="block font-medium mb-1">Calle/ Avenida</label>
                  <Input id="calle" placeholder="Núm" />
                </div>
                <div>
                  <label htmlFor="edificio" className="block font-medium mb-1">Nro. de edificio</label>
                  <Input id="edificio" placeholder="Núm" />
                </div>
                <div>
                  <label htmlFor="referencia" className="block font-medium mb-1">Referencia</label>
                  <Input id="referencia" placeholder="Núm" />
                </div>
              </div>
            </Card>
          )}
          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={handleCancel}>Cancelar</Button>
            <Button
              variant="default"
              type="submit"
            >
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditarUsuario;