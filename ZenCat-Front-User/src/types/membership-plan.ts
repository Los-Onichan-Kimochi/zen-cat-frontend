export enum MembershipPlanType {
  MONTHLY = 'Mensual',
  ANUAL = 'Anual',
}

export interface MembershipPlan {
  id: string;
  fee: number;
  type: MembershipPlanType;
  reservation_limit?: number | null;
}

export interface CreateMembershipPlanPayload {
  fee: number;
  type: MembershipPlanType;
  reservation_limit?: number | null;
}

export type UpdateMembershipPlanPayload = Partial<CreateMembershipPlanPayload>;

export interface BulkCreateMembershipPlanPayload {
  plans: CreateMembershipPlanPayload[];
}

export interface BulkDeleteMembershipPlanPayload {
  plans: string[]; // array of membership plan IDs
}
