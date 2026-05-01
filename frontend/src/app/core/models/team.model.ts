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

/** Checklists hub, drawer item, header + button — single role list per build plan 3.2 */
export const CHECKLIST_ACCESS_ROLES: readonly UserRole[] = ALL_ROLES;

/**
 * Map a profiles.role value from Supabase (or any API) to a known UserRole.
 * Handles casing and separators so checklist access checks stay reliable.
 */
export function parseUserRole(raw: unknown): UserRole | null {
  if (raw == null || raw === '') return null;
  const n = String(raw).trim().toLowerCase().replace(/[\s-]+/g, '_');
  return ALL_ROLES.includes(n as UserRole) ? (n as UserRole) : null;
}

export interface Team {
  id: string;
  name: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: MemberStatus;
  avatarUrl?: string;
  dateAdded: string;
  teamId?: string;
  teamName?: string;
}

export interface InviteMemberDto {
  name: string;
  email: string;
  role: UserRole;
  teamId?: string;
}
