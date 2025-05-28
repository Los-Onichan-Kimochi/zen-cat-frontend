import * as React from "react";
import {
  UserPlusIcon,
  UsersIcon,
  CreditCardIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

interface Step {
  title: string;
  description: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const steps: Step[] = [
  {
    title: "Regístrate",
    description: "Crea tu cuenta en segundos con tu correo o Google",
    Icon: UserPlusIcon,
  },
  {
    title: "Afíliate a comunidades",
    description: "Únete a grupos como runners, ciclistas o músicos",
    Icon: UsersIcon,
  },
  {
    title: "Activa tu membresía",
    description: "Elige tu plan mensual o anual y accede a los servicios",
    Icon: CreditCardIcon,
  },
  {
    title: "Reserva lo que necesitas",
    description:
      "Selecciona tu clase, horario y recibe confirmación automática",
    Icon: CalendarIcon,
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="bg-black my-20 pt-13 pb-16">
      <div className="max-w-6xl mx-auto px-4 text-center">
        {/* Título */}
        <h2 className="text-3xl md:text-6xl font-black text-white mb-2">
          ¿Cómo funciona?
        </h2>
        <p className="text-lg text-gray-300 mb-12">
          Activa tu camino hacia el bienestar, paso a paso
        </p>

        {/* Grid de pasos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ title, description, Icon }, i) => (
            <div
              key={i}
              className="group flex flex-col items-center text-center px-12 transform transition-transform duration-300 hover:-translate-y-2"
            >
              {/* Icono dentro de círculo */}
              <div className="bg-white p-9 rounded-full shadow-lg mb-4 transform transition-transform duration-300 group-hover:scale-110">
                <Icon className="h-15 w-15 text-gray-900" />
              </div>
              {/* Número y título */}
              <h3 className="text-xl font-semibold text-white mb-1">
                {i + 1}. {title}
              </h3>
              {/* Descripción */}
              <p className="text-sm text-gray-300">{description}</p>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 mt-12">
          Los beneficios dependen del tipo de membresía activa. Puedes
          afiliarte, modificar o cancelar tu plan en cualquier momento desde
          “Mi Perfil”.
        </p>
      </div>
    </section>
  );
};

export default HowItWorks;
