import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { User } from "@/types/user";
import { authApi } from "@/api/auth/auth";
import { RouterContext } from "@/types/router";
import { Plus } from "lucide-react";



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
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#fafbfc] w-full">
      <div className="w-full max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-5xl font-black mb-2">USUARIOS</h1>
        <h2 className="text-2xl font-bold mb-6">AGREGAR USUARIO</h2>

        {/* Datos principales */}
        <Card className="mb-6 p-6">
          <h3 className="text-xl font-bold mb-4">Datos principales del usuario</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="nombres" className="block font-medium mb-1">Nombres</label>
                <Input id="nombres" placeholder="Ingrese los nombres del usuario" />
              </div>
              <div>
                <label htmlFor="primer-apellido" className="block font-medium mb-1">Primer apellido</label>
                <Input id="primer-apellido" placeholder="Ingrese el primer apellido del usuario" />
              </div>
              <div>
                <label htmlFor="segundo-apellido" className="block font-medium mb-1">Segundo apellido</label>
                <Input id="segundo-apellido" placeholder="Ingrese el segundo apellido del usuario" />
              </div>
              <div>
                <label htmlFor="correo" className="block font-medium mb-1">Correo electrónico</label>
                <Input id="correo" placeholder="Ingrese el correo electrónico del profesional" />
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

        {/* Datos del onboarding */}
        <Card className="mb-6 p-6">
          <h3 className="text-xl font-bold mb-4">Datos del onboarding</h3>
          <div className="mb-4 font-semibold">Información personal</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="celular" className="block font-medium mb-1">Número de celular</label>
              <Input id="celular" placeholder="Ingrese el número de teléfono" />
            </div>
            <div>
              <label htmlFor="tipo-doc" className="block font-medium mb-1">Tipo de documento</label>
              <Input id="tipo-doc" placeholder="Seleccione un tipo de documento" />
            </div>
            <div>
              <label htmlFor="num-doc" className="block font-medium mb-1">Número de documento</label>
              <Input id="num-doc" placeholder="Ingrese el número del documento" />
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

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <Button variant="outline">Cancelar</Button>
          <Button
            className="bg-black text-white font-bold rounded-lg flex items-center gap-2 px-5 py-2 h-11 shadow hover:bg-gray-900 transition-all"
            onClick={() => navigate({ to: '/usuarios/agregar' })}
          >
            Agregar <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AgregarUsuario;