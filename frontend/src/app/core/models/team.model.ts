export type UserRole = 'administrator' | 'team_lead' | 'team_member' | 'executive';
export type MemberStatus = 'active' | 'invited' | 'inactive';

export const ROLE_LABELS: Record<UserRole, string> = {
  administrator: 'Administrator',
  team_lead: 'Team Lead',
  team_member: 'Team Member',
  executive: 'Executive',
};

export const ALL_ROLES: UserRole[] = [
  'administrator',
  'team_lead',
  'team_member',
  'executive',
];

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: MemberStatus;
  avatarUrl?: string;
  dateAdded: string;
}

export interface InviteMemberDto {
  name: string;
  email: string;
  role: UserRole;
}
