import * as React from "react";
import PlanCard, { PlanCardProps } from "./PlanCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";


// 1. Define los 4 planes y sepáralos en mensuales y anuales
const allPlans: PlanCardProps[] = [
  {
    title: "Plan Mensual/Básico",
    subtitle: "Ideal para quienes recién comienzan",
    features: [
      "Acceso a una comunidad",
      "Realiza un número limitado de reservas al mes",
      "Recibe notificaciones de confirmación y cancelación",
      "Consulta tu historial de reservas desde el perfil",
      "Puedes desactivar tu membresía desde el perfil",
    ],
    buttonLabel: "Empezar con este",
  },
  {
    title: "Plan Mensual/Ilimitado",
    subtitle: "Tu acceso sin restricciones",
    features: [
      "Accede a varias comunidades activas",
      "Realiza reservas ilimitadas",
      "Recibe notificaciones completas y recordatorios",
      "Consulta tu historial completo desde el perfil",
      "Cambia o cancela tu plan en cualquier momento",
    ],
    buttonLabel: "Activar acceso libre",
  },
  {
    title: "Plan Anual/Básico",
    subtitle: "Organización + largo plazo",
    features: [
      "Accede a hasta 2 comunidades",
      "Realiza un número limitado de reservas al mes",
      "Recibe alertas de confirmación y cancelación",
      "Consulta tu historial de actividad",
      "Puedes cambiar o pausar tu plan sin penalización",
    ],
    buttonLabel: "Elegir este plan",
  },
  {
    title: "Plan Anual/Ilimitado",
    subtitle: "Acceso completo para líderes",
    features: [
      "Accede a todas las comunidades habilitadas",
      "Realiza reservas ilimitadas sin restricciones",
      "Activa herramientas adicionales y métricas personales",
      "Consulta detallada del historial de actividad",
      "Tu cuenta se mantiene activa mientras esté vigente",
    ],
    buttonLabel: "Activar acceso completo",
    highlight: true,
  },
];

const monthlyPlans = allPlans.slice(0, 2);
const annualPlans = allPlans.slice(2, 4);

const PlanSection: React.FC = () => {
  return (
    <section className="bg-gray-50 pb-16">
      {/* 1. Encabezado */}
      <div className="max-w-4xl mx-auto px-6 text-center mb-8">
        <p className="text-sm font-medium uppercase text-gray-600 mb-2">
          Tipos de Acceso
        </p>
        <h2 className="text-6xl font-black text-gray-900 mb-4">
          Elige el plan que se adapta a tu <u>ritmo</u>
        </h2>
        <p className="text-lg text-gray-700">
          Activa tu membresía según tus necesidades.
        </p>
      </div>

      {/* 2. Contenedor de Tabs (Mensual / Anual) */}
      <div className="max-w-4xl mx-auto px-6 mb-6">
        <Tabs defaultValue="mensual" className="w-full">
          {/* 2.1 Lista de pestañas */}
          <TabsList className="grid w-full grid-cols-2 rounded-full bg-gray-200 p-1">
            <TabsTrigger
              value="mensual"
              className="rounded-full px-4 py-2 text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500"
            >
              Mensual
            </TabsTrigger>
            <TabsTrigger
              value="anual"
              className="rounded-full px-4 py-2 text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500"
            >
              Anual
            </TabsTrigger>
          </TabsList>

          {/* 2.2 Contenido de cada pestaña */}
          <TabsContent value="mensual" className="mt-6">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {monthlyPlans.map((plan) => (
                <PlanCard key={plan.title} {...plan} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="anual" className="mt-6">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {annualPlans.map((plan) => (
                <PlanCard key={plan.title} {...plan} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 3. Disclaimer */}
      <p className="max-w-3xl mx-auto px-6 text-center text-xs text-gray-500 mt-8">
        Los beneficios dependen del tipo de membresía activa. Puedes afiliarte,
        modificar o cancelar tu plan en cualquier momento desde “Mi Perfil”.
      </p>
    </section>
  );
};

export default PlanSection;
