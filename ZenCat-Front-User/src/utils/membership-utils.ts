import { Membership } from '@/types/user';
import { Community as FrontendCommunity } from '@/components/communities/CommunityCard';

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
  }));
}

/**
 * Map API membership status to frontend status
 */
function mapMembershipStatus(
  apiStatus: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED',
): 'active' | 'suspended' | 'expired' {
  const statusMap = {
    ACTIVE: 'active' as const,
    SUSPENDED: 'suspended' as const,
    EXPIRED: 'expired' as const,
  };

  return statusMap[apiStatus];
}

/**
 * Get status display text in Spanish
 */
export function getStatusDisplayText(
  status: 'active' | 'suspended' | 'expired',
): string {
  const statusText = {
    active: 'Membresía activa',
    suspended: 'Membresía suspendida',
    expired: 'Membresía vencida',
  };

  return statusText[status];
}
