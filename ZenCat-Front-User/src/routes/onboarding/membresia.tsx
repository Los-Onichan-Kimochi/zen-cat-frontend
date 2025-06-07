import { createFileRoute } from '@tanstack/react-router';
import { MembershipOnboarding } from '@/components/ui/membership/MembershipOnboarding';
import { MembershipOnboardingProvider } from '@/context/MembershipOnboardingContext';
import { Community, MembershipPlan } from '@/types/membership';

// Datos de ejemplo - en una app real, estos vendrían de una API
const mockCommunity: Community = {
  id: '1',
  name: 'Runners',
  description: 'Comunidad de corredores apasionados',
  image: '/community-runners.jpg',
  membershipPlans: []
};

const mockPlans: MembershipPlan[] = [
  {
    id: '1',
    name: 'Plan básico',
    type: 'Mensual',
    price: 959.90,
    duration: '/mes',
    features: [
      'Acceso a una comunidad',
      'Realiza 20 reservas al mes',
      'Recibe notificaciones',
      'Consulta tu historial de reservas',
      'Puedes desactivar tu membresía desde el perfil'
    ],
    reservationLimit: 20
  },
  {
    id: '2',
    name: 'Plan básico',
    type: 'Anual',
    price: 1919.90,
    duration: '/mes',
    features: [
      'Acceso a una comunidad',
      'Realiza un número ilimitado de reservas al mes',
      'Recibe notificaciones',
      'Consulta tu historial de reservas',
      'Puedes desactivar tu membresía desde el perfil'
    ]
  }
];

export const Route = createFileRoute('/onboarding/membresia')({
  component: OnboardingMembresiaComponent,
});

function OnboardingMembresiaComponent() {
  return (
    <MembershipOnboardingProvider>
      <MembershipOnboarding
        community={mockCommunity}
        plans={mockPlans}
      />
    </MembershipOnboardingProvider>
  );
} 