import * as React from "react";
import PlanCard, { PlanCardProps } from "./PlanCard";

const plans: PlanCardProps[] = [
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

const PlansSection: React.FC = () => (
  <section className="bg-gray-50 pb-16">
    {/* Encabezado */}
    <div className="max-w-4xl mx-auto px-6 text-center mb-12">
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

    {/* Grid de cards */}
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {plans.map((p) => (
        <PlanCard key={p.title} {...p} />
      ))}
    </div>

    {/* Disclaimer */}
    <p className="max-w-3xl mx-auto px-6 text-center text-xs text-gray-500 mt-8">
      Los beneficios dependen del tipo de membresía activa. Puedes afiliarte,
      modificar o cancelar tu plan en cualquier momento desde “Mi Perfil”.
    </p>
  </section>
);

export default PlansSection;
