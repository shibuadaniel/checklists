import { TeamMember } from '../models/team.model';

export const MOCK_TEAM: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'administrator',
    status: 'active',
    dateAdded: '2026-01-15T00:00:00Z',
  },
  {
    id: '2',
    name: 'Marcus Rivera',
    email: 'marcus.rivera@company.com',
    role: 'team_lead',
    status: 'active',
    dateAdded: '2026-02-03T00:00:00Z',
  },
  {
    id: '3',
    name: 'Priya Patel',
    email: 'priya.patel@company.com',
    role: 'team_member',
    status: 'active',
    dateAdded: '2026-02-10T00:00:00Z',
  },
  {
    id: '4',
    name: 'James O\'Brien',
    email: 'james.obrien@company.com',
    role: 'team_member',
    status: 'invited',
    dateAdded: '2026-04-20T00:00:00Z',
  },
  {
    id: '5',
    name: 'Linda Chen',
    email: 'linda.chen@company.com',
    role: 'executive',
    status: 'active',
    dateAdded: '2026-01-20T00:00:00Z',
  },
  {
    id: '6',
    name: 'Tom Nguyen',
    email: 'tom.nguyen@company.com',
    role: 'team_member',
    status: 'inactive',
    dateAdded: '2026-03-01T00:00:00Z',
  },
];
