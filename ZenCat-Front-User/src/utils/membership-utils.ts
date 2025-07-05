import { Community as FrontendCommunity } from '@/components/communities/CommunityCard';
import { Membership, MembershipState } from '@/types/membership';

/**
 * Transform API membership data to frontend format
 */
export function transformMembershipsToFrontend(
  memberships: Membership[],
): FrontendCommunity[] {
  return memberships.map((membership) => ({
    id: membership.community.id,
    name: membership.community.name,
    type: membership.community.purpose,
    status: mapMembershipStatus(membership.status),
    membershipId: membership.id,
    startDate: membership.start_date,
    endDate: membership.end_date,
    planType: membership.plan.type,
    fee: membership.plan.fee,
    reservationLimit: membership.plan.reservation_limit,
    image: membership.community.image_url,
  }));
}

/**
 * Map API membership status to frontend status
 */
function mapMembershipStatus(
  apiStatus: MembershipState,
): 'active' | 'suspended' | 'expired' | 'cancelled' {
  const statusMap = {
    [MembershipState.ACTIVE]: 'active' as const,
    [MembershipState.SUSPENDED]: 'suspended' as const,
    [MembershipState.EXPIRED]: 'expired' as const,
    [MembershipState.CANCELLED]: 'cancelled' as const, // Tratamos canceladas como expiradas para el frontend
  };

  return statusMap[apiStatus];
}

/**
 * Get status display text in Spanish
 */
export function getStatusDisplayText(
  status: 'active' | 'suspended' | 'expired' | 'cancelled',
): string {
  const statusText = {
    active: 'Membresía activa',
    suspended: 'Membresía suspendida',
    expired: 'Membresía vencida',
    cancelled: 'Membresía cancelada',
  };

  return statusText[status];
}

/**
 * Get status color for badges
 */
export function getStatusColor(status: MembershipState): string {
  switch (status) {
    case MembershipState.ACTIVE:
      return 'bg-green-100 text-green-800';
    case MembershipState.SUSPENDED:
      return 'bg-orange-100 text-orange-800';
    case MembershipState.EXPIRED:
      return 'bg-gray-100 text-gray-800';
    case MembershipState.CANCELLED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
}

/**
 * Map MembershipState to Spanish display text
 */
export function mapMembershipStateToSpanish(
  status: MembershipState,
): 'En proceso' | 'Activa' | 'Suspendida' | 'Expirada' | 'Cancelada' {
  const statusMap = {
    [MembershipState.ACTIVE]: 'Activa' as const,
    [MembershipState.SUSPENDED]: 'Suspendida' as const,
    [MembershipState.EXPIRED]: 'Expirada' as const,
    [MembershipState.CANCELLED]: 'Cancelada' as const,
  };

  return statusMap[status] || 'En proceso';
}
